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
	"github.com/twmb/franz-go/pkg/kgo"
	"seiko/integration-service/adapters"
)

var (
	consumed = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_consumed_total",
		Help: "Total Kafka events consumed from orders.created",
	}, []string{"topic"})

	failed = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "integration_events_failed_total",
		Help: "Total Kafka events that failed processing",
	}, []string{"topic"})

	duration = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "integration_event_processing_duration_seconds",
		Help:    "Time spent processing a single Kafka event",
		Buckets: prometheus.DefBuckets,
	})
)

func Start(db *sql.DB) {
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
		log.Fatalf("Kafka client error: %v", err)
	}
	defer cl.Close()

	log.Printf("consumer: connected to %s, listening on orders.created", broker)

	for {
		fetches := cl.PollFetches(context.Background())
		fetches.EachError(func(_ string, _ int32, err error) {
			log.Printf("consumer fetch error: %v", err)
		})
		fetches.EachRecord(func(r *kgo.Record) {
			start := time.Now()
			topic := r.Topic
			consumed.WithLabelValues(topic).Inc()

			var payload map[string]interface{}
			if err := json.Unmarshal(r.Value, &payload); err != nil {
				log.Printf("unmarshal error: %v", err)
				failed.WithLabelValues(topic).Inc()
				insertLog(db, nil, "servicenow", "failed", r.Value, err.Error())
				return
			}

			err := adapters.ForwardToServiceNow(payload)
			status := "success"
			errMsg := ""
			if err != nil {
				log.Printf("ServiceNow forward error: %v", err)
				status = "failed"
				errMsg = err.Error()
				failed.WithLabelValues(topic).Inc()
			}

			orderID := extractOrderID(payload)
			insertLog(db, orderID, "servicenow", status, r.Value, errMsg)
			duration.Observe(time.Since(start).Seconds())
			log.Printf("processed order event orderId=%v status=%s", payload["orderId"], status)
		})
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
