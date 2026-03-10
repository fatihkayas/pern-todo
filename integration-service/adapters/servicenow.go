package adapters

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strconv"
)

// ForwardToServiceNow sends an order event to ServiceNow.
//
// Modes (evaluated in order):
//  1. SERVICENOW_CHAOS_FAILURE_RATE=N  — chaos mode: return an error N% of the time.
//     Useful for live resilience testing without touching ServiceNow.
//  2. SERVICENOW_URL unset              — mock mode: always succeed silently.
//  3. SERVICENOW_URL set                — real mode: POST to the configured URL.
func ForwardToServiceNow(payload map[string]interface{}) error {
	// ── Chaos mode ────────────────────────────────────────────────────────────
	if rate, err := strconv.Atoi(os.Getenv("SERVICENOW_CHAOS_FAILURE_RATE")); err == nil && rate > 0 {
		if rand.Intn(100) < rate { //nolint:gosec // weak rand is fine for chaos
			return fmt.Errorf("chaos: simulated ServiceNow failure (rate=%d%%)", rate)
		}
	}

	url := os.Getenv("SERVICENOW_URL")
	if url == "" {
		// Mock mode — no real ServiceNow configured, succeed silently.
		return nil
	}

	body, _ := json.Marshal(map[string]interface{}{
		"short_description": fmt.Sprintf("New order received: orderId=%v", payload["orderId"]),
		"description":       fmt.Sprintf("Order event: %v", payload),
		"category":          "order",
	})

	resp, err := http.Post(url, "application/json", bytes.NewReader(body)) //nolint:noctx
	if err != nil {
		return fmt.Errorf("ServiceNow request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("ServiceNow returned HTTP %d", resp.StatusCode)
	}
	return nil
}
