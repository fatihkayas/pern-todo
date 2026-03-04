# ── Backend Cloud Run service ──────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region

  template {
    service_account = var.service_account_email

    # Mount Cloud SQL socket (no public IP needed — auth proxy built into Cloud Run)
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [var.cloud_sql_connection_name]
      }
    }

    containers {
      image = "${var.registry}/${var.app_name}-backend:latest"

      ports {
        container_port = 5000
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      # Runtime environment
      env { name = "NODE_ENV";    value = "production" }
      env { name = "DB_USER";     value = "psqladmin" }
      env { name = "DB_DATABASE"; value = "jwtauth" }
      env { name = "DB_PORT";     value = "5432" }
      # Unix socket path — pg library handles this transparently (no code change needed)
      env { name = "DB_HOST"; value = "/cloudsql/${var.cloud_sql_connection_name}" }
      env { name = "DB_SSL";  value = "false" }

      # Secrets from Secret Manager
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.db_password_secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = var.stripe_secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "STRIPE_WEBHOOK_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.stripe_webhook_secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.jwt_secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  name     = google_cloud_run_v2_service.backend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── Frontend Cloud Run service ─────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region

  template {
    service_account = var.service_account_email

    containers {
      image = "${var.registry}/${var.app_name}-frontend:latest"

      ports {
        container_port = 3000
      }

      env { name = "BROWSER";                       value = "none" }
      env { name = "DANGEROUSLY_DISABLE_HOST_CHECK"; value = "true" }
      env { name = "CHOKIDAR_USEPOLLING";            value = "false" }

      resources {
        limits = {
          cpu    = "0.5"
          memory = "256Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
