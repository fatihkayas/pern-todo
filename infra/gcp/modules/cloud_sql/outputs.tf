output "connection_name" {
  description = "Cloud SQL instance connection name (project:region:instance)"
  value       = google_sql_database_instance.postgres.connection_name
}

output "socket_path" {
  description = "Unix socket path to use as DB_HOST in Cloud Run"
  value       = "/cloudsql/${google_sql_database_instance.postgres.connection_name}"
}
