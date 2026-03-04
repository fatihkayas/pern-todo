resource "google_sql_database_instance" "postgres" {
  name             = "${var.app_name}-postgres"
  database_version = "POSTGRES_15"
  region           = var.region

  deletion_protection = false

  settings {
    tier      = "db-f1-micro"
    disk_size = 10
    disk_type = "PD_SSD"

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      # No public IP — backend connects via Cloud SQL Auth Proxy socket
      ipv4_enabled = false
    }

    insights_config {
      query_insights_enabled = false
    }
  }
}

resource "google_sql_database" "jwtauth" {
  name     = "jwtauth"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "psqladmin" {
  name     = "psqladmin"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}
