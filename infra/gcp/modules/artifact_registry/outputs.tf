output "hostname" {
  description = "Artifact Registry Docker hostname (for gcloud auth configure-docker)"
  value       = "${var.region}-docker.pkg.dev"
}

output "repository_url" {
  description = "Full repository URL prefix for image tags"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}"
}
