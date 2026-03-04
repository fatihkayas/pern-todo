output "backend_url" {
  description = "Cloud Run backend service URL"
  value       = module.cloud_run.backend_url
}

output "frontend_url" {
  description = "Cloud Run frontend service URL"
  value       = module.cloud_run.frontend_url
}

output "ar_hostname" {
  description = "Artifact Registry hostname for Docker login (e.g. europe-west1-docker.pkg.dev)"
  value       = module.artifact_registry.hostname
}

output "ar_repository_url" {
  description = "Full Artifact Registry repository URL"
  value       = module.artifact_registry.repository_url
}

output "wif_provider" {
  description = "Workload Identity Federation provider resource name — use as GCP_WORKLOAD_IDENTITY_PROVIDER secret"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "service_account_email" {
  description = "Service account email — use as GCP_SERVICE_ACCOUNT secret"
  value       = google_service_account.runner.email
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = module.cloud_sql.connection_name
}
