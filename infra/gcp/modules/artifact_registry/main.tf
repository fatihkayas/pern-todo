resource "google_artifact_registry_repository" "seiko" {
  location      = var.region
  repository_id = var.app_name
  description   = "Seiko Watch Store container images"
  format        = "DOCKER"
}
