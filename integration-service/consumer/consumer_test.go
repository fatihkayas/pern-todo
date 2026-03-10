package consumer

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/prometheus/client_golang/prometheus/testutil"
	"github.com/sony/gobreaker"
	"github.com/twmb/franz-go/pkg/kgo"
)

func init() {
	// Replace real sleep with a no-op so retry tests run in microseconds.
	backoffFn = func(_ time.Duration) {}
}

// ── Mock adapter ──────────────────────────────────────────────────────────────

// failNAdapter fails the first N calls then succeeds.
type failNAdapter struct {
	calls     int
	failUntil int
	err       error
}

func (a *failNAdapter) Forward(_ map[string]interface{}) error {
	a.calls++
	if a.calls <= a.failUntil {
		return a.err
	}
	return nil
}

// alwaysFailAdapter never succeeds.
type alwaysFailAdapter struct {
	calls int
	err   error
}

func (a *alwaysFailAdapter) Forward(_ map[string]interface{}) error {
	a.calls++
	return a.err
}

// successAdapter always succeeds.
type successAdapter struct{ calls int }

func (a *successAdapter) Forward(_ map[string]interface{}) error {
	a.calls++
	return nil
}

// resetCB replaces the package-level circuit breaker with a fresh one.
func resetCB() {
	sn = gobreaker.NewCircuitBreaker(gobreaker.Settings{
		Name:        "servicenow-test",
		MaxRequests: 3,
		Interval:    30 * time.Second,
		Timeout:     60 * time.Second,
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			return counts.ConsecutiveFailures >= 5
		},
	})
}

func makeRecord(orderID int) *kgo.Record {
	b, _ := json.Marshal(map[string]interface{}{
		"orderId":     float64(orderID),
		"customerId":  float64(1),
		"totalAmount": "99.99",
		"items":       []interface{}{},
		"timestamp":   "2026-01-01T00:00:00Z",
	})
	return &kgo.Record{Topic: "orders.created", Key: []byte("1"), Value: b}
}

// ── withRetry unit tests ──────────────────────────────────────────────────────

func TestWithRetry_SuccessOnFirstAttempt(t *testing.T) {
	calls := 0
	err := withRetry("test", func() error { calls++; return nil }, 3)
	if err != nil || calls != 1 {
		t.Fatalf("got err=%v calls=%d, want err=nil calls=1", err, calls)
	}
}

func TestWithRetry_SucceedsAfterTwoFailures(t *testing.T) {
	calls := 0
	err := withRetry("test", func() error {
		calls++
		if calls < 3 {
			return errors.New("transient")
		}
		return nil
	}, 3)
	if err != nil || calls != 3 {
		t.Fatalf("got err=%v calls=%d, want err=nil calls=3", err, calls)
	}
}

func TestWithRetry_ExhaustsAllAttempts(t *testing.T) {
	calls := 0
	sentinel := errors.New("permanent")
	err := withRetry("test", func() error { calls++; return sentinel }, 3)
	if !errors.Is(err, sentinel) || calls != 3 {
		t.Fatalf("got err=%v calls=%d, want sentinel calls=3", err, calls)
	}
}

func TestWithRetry_NoRetryOnCircuitBreakerOpen(t *testing.T) {
	calls := 0
	err := withRetry("test", func() error {
		calls++
		return gobreaker.ErrOpenState
	}, 3)
	if !errors.Is(err, gobreaker.ErrOpenState) || calls != 1 {
		t.Fatalf("CB open should not be retried: err=%v calls=%d", err, calls)
	}
}

// ── Circuit breaker tests ─────────────────────────────────────────────────────

func TestCircuitBreaker_OpensAfterFiveFailures(t *testing.T) {
	resetCB()
	permErr := errors.New("down")
	for i := 0; i < 5; i++ {
		sn.Execute(func() (interface{}, error) { return nil, permErr }) //nolint:errcheck
	}
	_, err := sn.Execute(func() (interface{}, error) { return nil, nil })
	if !errors.Is(err, gobreaker.ErrOpenState) {
		t.Fatalf("expected CB open after 5 failures, got %v", err)
	}
}

// ── processRecord chaos scenarios ─────────────────────────────────────────────

func TestProcessRecord_HappyPath(t *testing.T) {
	resetCB()
	adapter := &successAdapter{}
	processRecord(context.Background(), nil, nil, makeRecord(1), adapter)
	if adapter.calls != 1 {
		t.Fatalf("expected 1 adapter call, got %d", adapter.calls)
	}
}

func TestProcessRecord_RetriesTransientFailure(t *testing.T) {
	resetCB()
	// Fail twice, succeed on 3rd.
	adapter := &failNAdapter{failUntil: 2, err: errors.New("transient")}
	processRecord(context.Background(), nil, nil, makeRecord(2), adapter)
	if adapter.calls != 3 {
		t.Fatalf("expected 3 calls (2 fail + 1 success), got %d", adapter.calls)
	}
}

func TestProcessRecord_DLQAfterExhaustedRetries(t *testing.T) {
	resetCB()
	adapter := &alwaysFailAdapter{err: errors.New("permanent")}

	before := testutil.ToFloat64(dlqSent.WithLabelValues("orders.created"))
	processRecord(context.Background(), nil, nil, makeRecord(3), adapter)
	after := testutil.ToFloat64(dlqSent.WithLabelValues("orders.created"))

	if after-before < 1 {
		t.Fatal("DLQ counter should be incremented after exhausted retries")
	}
	if adapter.calls != maxRetries {
		t.Fatalf("expected %d adapter calls, got %d", maxRetries, adapter.calls)
	}
}

func TestProcessRecord_InvalidJSONSendsToDLQ(t *testing.T) {
	resetCB()
	adapter := &successAdapter{}
	bad := &kgo.Record{Topic: "orders.created", Key: []byte("x"), Value: []byte(`{bad json`)}

	before := testutil.ToFloat64(dlqSent.WithLabelValues("orders.created"))
	processRecord(context.Background(), nil, nil, bad, adapter)
	after := testutil.ToFloat64(dlqSent.WithLabelValues("orders.created"))

	if after-before < 1 {
		t.Fatal("invalid JSON should route to DLQ")
	}
	if adapter.calls != 0 {
		t.Fatal("adapter should not be called for invalid JSON")
	}
}

func TestProcessRecord_CircuitBreakerOpenBlocksAdapter(t *testing.T) {
	resetCB()
	// Force CB open with 5 failures.
	for i := 0; i < 5; i++ {
		sn.Execute(func() (interface{}, error) { return nil, errors.New("down") }) //nolint:errcheck
	}

	adapter := &failNAdapter{failUntil: 999, err: errors.New("unreachable")}
	processRecord(context.Background(), nil, nil, makeRecord(4), adapter)

	// CB is open — adapter.Forward is never invoked.
	if adapter.calls != 0 {
		t.Fatalf("open CB should block adapter calls entirely, got %d calls", adapter.calls)
	}
}
