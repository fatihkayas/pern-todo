package adapters

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

// ForwardToServiceNow sends an order event to ServiceNow.
// If SERVICENOW_URL is not set, operates in mock mode and always returns nil.
func ForwardToServiceNow(payload map[string]interface{}) error {
	url := os.Getenv("SERVICENOW_URL")
	if url == "" {
		// Mock mode — no real ServiceNow configured
		return nil
	}

	body, _ := json.Marshal(map[string]interface{}{
		"short_description": fmt.Sprintf("New order received: orderId=%v", payload["orderId"]),
		"description":       fmt.Sprintf("Order event: %v", payload),
		"category":          "order",
	})

	resp, err := http.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("ServiceNow request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("ServiceNow returned HTTP %d", resp.StatusCode)
	}
	return nil
}
