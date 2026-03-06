terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── Enable required APIs ───────────────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

# ── Service Account (Cloud Run runtime + GitHub Actions CI/CD) ─────────────────
resource "google_service_account" "runner" {
  account_id   = "${var.app_name}-runner"
  display_name = "Seiko CI/CD and Cloud Run SA"
  depends_on   = [google_project_service.apis]
}

locals {
  sa_roles = [
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/secretmanager.secretAccessor",
    "roles/cloudsql.client",
    "roles/iam.serviceAccountUser",
  ]
}

resource "google_project_iam_member" "runner_roles" {
  for_each = toset(local.sa_roles)
  project  = var.project_id
  role     = each.key
  member   = "serviceAccount:${google_service_account.runner.email}"
}

# ── Workload Identity Federation (GitHub Actions OIDC — no long-lived keys) ────
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "${var.app_name}-gh-pool-v2"
  display_name              = "GitHub Actions Pool"
  depends_on                = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub OIDC Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.runner.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# ── Secret Manager ─────────────────────────────────────────────────────────────
resource "google_secret_manager_secret" "db_password" {
  secret_id  = "${var.app_name}-db-password"
  depends_on = [google_project_service.apis]
  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "stripe_secret_key" {
  secret_id  = "${var.app_name}-stripe-secret-key"
  depends_on = [google_project_service.apis]
  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "stripe_secret_key" {
  secret      = google_secret_manager_secret.stripe_secret_key.id
  secret_data = var.stripe_secret_key
}

resource "google_secret_manager_secret" "stripe_webhook_secret" {
  secret_id  = "${var.app_name}-stripe-webhook-secret"
  depends_on = [google_project_service.apis]
  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "stripe_webhook_secret" {
  secret      = google_secret_manager_secret.stripe_webhook_secret.id
  secret_data = var.stripe_webhook_secret
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id  = "${var.app_name}-jwt-secret"
  depends_on = [google_project_service.apis]
  replication {
    auto {}
  }
}
resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

# ── Modules ────────────────────────────────────────────────────────────────────
module "artifact_registry" {
  source     = "./modules/artifact_registry"
  app_name   = var.app_name
  region     = var.region
  project_id = var.project_id
  depends_on = [google_project_service.apis]
}

module "cloud_sql" {
  source      = "./modules/cloud_sql"
  app_name    = var.app_name
  region      = var.region
  project_id  = var.project_id
  db_password = var.db_password
  depends_on  = [google_project_service.apis]
}

module "cloud_run" {
  source                    = "./modules/cloud_run"
  app_name                  = var.app_name
  region                    = var.region
  project_id                = var.project_id
  registry                  = module.artifact_registry.repository_url
  service_account_email     = google_service_account.runner.email
  cloud_sql_connection_name = module.cloud_sql.connection_name
  db_password_secret_id     = google_secret_manager_secret.db_password.secret_id
  stripe_secret_id          = google_secret_manager_secret.stripe_secret_key.secret_id
  stripe_webhook_secret_id  = google_secret_manager_secret.stripe_webhook_secret.secret_id
  jwt_secret_id             = google_secret_manager_secret.jwt_secret.secret_id
  depends_on = [
    google_project_service.apis,
    module.cloud_sql,
    google_project_iam_member.runner_roles,
  ]
}
