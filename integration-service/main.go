package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/lib/pq"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"seiko/integration-service/consumer"
)

func main() {
	db := connectDB()
	runMigration(db)

	// ctx controls the consumer goroutine lifetime.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go consumer.Start(ctx, db)

	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok"}`)
	})

	srv := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// Start HTTP server in background.
	go func() {
		log.Println("integration-service listening on :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	// ── Graceful shutdown on SIGTERM / SIGINT ──────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	sig := <-quit
	log.Printf("received signal %s — shutting down", sig)

	cancel() // signal consumer to stop polling

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}

	log.Println("integration-service stopped")
}

func connectDB() *sql.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", ""),
		getEnv("DB_DATABASE", "jwtauth"),
	)
	var db *sql.DB
	var err error
	for i := 0; i < 5; i++ {
		db, err = sql.Open("postgres", dsn)
		if err == nil {
			if err = db.Ping(); err == nil {
				log.Println("Connected to PostgreSQL")
				return db
			}
		}
		log.Printf("DB connect attempt %d failed: %v", i+1, err)
		time.Sleep(3 * time.Second)
	}
	log.Fatalf("Cannot connect to PostgreSQL: %v", err)
	return nil
}

func runMigration(db *sql.DB) {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS integration_logs (
		log_id       SERIAL PRIMARY KEY,
		order_id     INTEGER,
		service      VARCHAR(100) NOT NULL,
		status       VARCHAR(50)  NOT NULL,
		payload      JSONB,
		error_message TEXT,
		created_at   TIMESTAMPTZ DEFAULT NOW()
	)`)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("integration_logs table ready")
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
