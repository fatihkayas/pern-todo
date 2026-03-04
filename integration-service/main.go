package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"seiko/integration-service/consumer"
)

func main() {
	db := connectDB()
	runMigration(db)

	go consumer.Start(db)

	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok"}`)
	})
	log.Println("integration-service listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
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
