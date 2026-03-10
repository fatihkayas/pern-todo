package consumer

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/sony/gobreaker"
	"github.com/twmb/franz-go/pkg/kgo"
	"seiko/integration-service/adapters"
)

const (
	maxRetries = 3
	dlqTopic   = "orders.created.dlq"
)

var (
	consumed = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_consumed_total",
		Help: "Total Kafka events consumed from orders.created",
	}, []string{"topic"})

	failed = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_failed_total",
		Help: "Total Kafka events that failed after all retries",
	}, []string{"topic"})

	retried = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_retried_total",
		Help: "Total retry attempts on transient adapter errors",
	}, []string{"topic"})

	dlqSent = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_dlq_total",
		Help: "Total events routed to the dead letter queue",
	}, []string{"topic"})

	skipped = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_skipped_total",
		Help: "Total duplicate events skipped (idempotency check)",
	}, []string{"topic"})

	duration = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "integration_event_processing_duration_seconds",
		Help:    "Time spent processing a single Kafka event",
		Buckets: prometheus.DefBuckets,
	})

	circuitState = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "integration_circuit_breaker_state",
		Help: "Circuit breaker state: 0=closed 1=open 2=half-open",
	}, []string{"name"})
)

// sn is the circuit breaker that wraps all ServiceNow adapter calls.
var sn *gobreaker.CircuitBreaker

func init() {
	sn = gobreaker.NewCircuitBreaker(gobreaker.Settings{
		Name:        "servicenow",
		MaxRequests: 3,                // probe requests allowed in half-open state
		Interval:    30 * time.Second, // sliding window for counting failures
		Timeout:     60 * time.Second, // how long to stay open before half-open
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			return counts.ConsecutiveFailures >= 5
		},
		OnStateChange: func(name string, from, to gobreaker.State) {
			log.Printf("circuit breaker %q: %s → %s", name, from, to)
			circuitState.WithLabelValues(name).Set(float64(to))
		},
	})
	circuitState.WithLabelValues("servicenow").Set(0) // initialise as closed
}

// Start consumes from orders.created until ctx is cancelled.
func Start(ctx context.Context, db *sql.DB) {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:29092"
	}

	cl, err := kgo.NewClient(
		kgo.SeedBrokers(broker),
		kgo.ConsumerGroup("seiko-integration-group"),
		kgo.ConsumeTopics("orders.created"),
	)
	if err != nil {
		log.Fatalf("Kafka consumer client error: %v", err)
	}
	defer cl.Close()

	// Separate client used only for DLQ produces.
	dlqClient, err := kgo.NewClient(kgo.SeedBrokers(broker))
	if err != nil {
		log.Printf("DLQ client init failed (DLQ disabled): %v", err)
		dlqClient = nil
	}
	if dlqClient != nil {
		defer dlqClient.Close()
	}

	log.Printf("consumer: connected to %s, listening on orders.created", broker)

	for {
		select {
		case <-ctx.Done():
			log.Println("consumer: shutting down")
			return
		default:
		}

		fetches := cl.PollFetches(ctx)
		if ctx.Err() != nil {
			return
		}
		fetches.EachError(func(_ string, _ int32, err error) {
			log.Printf("consumer fetch error: %v", err)
		})
		fetches.EachRecord(func(r *kgo.Record) {
			processRecord(ctx, db, dlqClient, r)
		})
	}
}

func processRecord(ctx context.Context, db *sql.DB, dlqClient *kgo.Client, r *kgo.Record) {
	start := time.Now()
	topic := r.Topic
	consumed.WithLabelValues(topic).Inc()

	var payload map[string]interface{}
	if err := json.Unmarshal(r.Value, &payload); err != nil {
		log.Printf("unmarshal error: %v", err)
		failed.WithLabelValues(topic).Inc()
		insertLog(db, nil, "servicenow", "failed", r.Value, err.Error())
		sendToDLQ(ctx, dlqClient, r)
		dlqSent.WithLabelValues(topic).Inc()
		return
	}

	orderID := extractOrderID(payload)

	// ── Idempotency: skip if already processed successfully ────────────────
	if orderID != nil && isAlreadyProcessed(db, *orderID) {
		log.Printf("skipping duplicate order event orderId=%v", *orderID)
		skipped.WithLabelValues(topic).Inc()
		return
	}

	// ── Retry with exponential backoff + circuit breaker ──────────────────
	err := withRetry(topic, func() error {
		_, cbErr := sn.Execute(func() (interface{}, error) {
			return nil, adapters.ForwardToServiceNow(payload)
		})
		return cbErr
	}, maxRetries)

	status := "success"
	errMsg := ""
	if err != nil {
		log.Printf("ServiceNow forward failed after %d attempts: %v", maxRetries, err)
		status = "failed"
		errMsg = err.Error()
		failed.WithLabelValues(topic).Inc()
		sendToDLQ(ctx, dlqClient, r)
		dlqSent.WithLabelValues(topic).Inc()
	}

	insertLog(db, orderID, "servicenow", status, r.Value, errMsg)
	duration.Observe(time.Since(start).Seconds())
	log.Printf("processed order event orderId=%v status=%s elapsed=%s",
		payload["orderId"], status, time.Since(start).Round(time.Millisecond))
}

// withRetry calls fn up to maxAttempts times with exponential backoff.
// Circuit breaker open/half-open errors are not retried.
func withRetry(topic string, fn func() error, maxAttempts int) error {
	var err error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err = fn()
		if err == nil {
			return nil
		}
		if err == gobreaker.ErrOpenState || err == gobreaker.ErrTooManyRequests {
			return err // no point retrying when the circuit is open
		}
		if attempt < maxAttempts {
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second // 1s → 2s → 4s
			log.Printf("retry %d/%d after %v: %v", attempt, maxAttempts, backoff, err)
			retried.WithLabelValues(topic).Inc()
			time.Sleep(backoff)
		}
	}
	return err
}

// isAlreadyProcessed returns true when a successful log entry exists for orderID.
// On DB error it returns false (fail open — process rather than silently drop).
func isAlreadyProcessed(db *sql.DB, orderID int) bool {
	var count int
	if err := db.QueryRow(
		`SELECT COUNT(*) FROM integration_logs WHERE order_id = $1 AND status = 'success'`,
		orderID,
	).Scan(&count); err != nil {
		log.Printf("idempotency check error: %v", err)
		return false
	}
	return count > 0
}

// sendToDLQ publishes the raw record to the dead letter queue topic.
func sendToDLQ(ctx context.Context, cl *kgo.Client, r *kgo.Record) {
	if cl == nil {
		return
	}
	results := cl.ProduceSync(ctx, &kgo.Record{
		Topic: dlqTopic,
		Key:   r.Key,
		Value: r.Value,
	})
	if err := results.FirstErr(); err != nil {
		log.Printf("DLQ produce error: %v", err)
	} else {
		log.Printf("sent record to DLQ topic=%s key=%s", dlqTopic, string(r.Key))
	}
}

func extractOrderID(payload map[string]interface{}) *int {
	if v, ok := payload["orderId"]; ok {
		if f, ok := v.(float64); ok {
			id := int(f)
			return &id
		}
	}
	return nil
}

func insertLog(db *sql.DB, orderID *int, service, status string, payload []byte, errMsg string) {
	_, err := db.Exec(
		`INSERT INTO integration_logs (order_id, service, status, payload, error_message) VALUES ($1, $2, $3, $4, $5)`,
		orderID, service, status, string(payload), nullableStr(errMsg),
	)
	if err != nil {
		log.Printf("Failed to insert integration_log: %v", err)
	}
}

func nullableStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
