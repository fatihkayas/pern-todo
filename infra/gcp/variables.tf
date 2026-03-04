variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "app_name" {
  type        = string
  default     = "seiko"
  description = "Application name prefix for all resources"
}

variable "region" {
  type        = string
  default     = "europe-west1"
  description = "GCP region for all resources"
}

variable "github_repo" {
  type        = string
  description = "GitHub repository in owner/repo format (e.g. fatihkayas/pern-todo)"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "PostgreSQL admin password"
}

variable "stripe_secret_key" {
  type        = string
  sensitive   = true
  description = "Stripe secret key"
}

variable "stripe_webhook_secret" {
  type        = string
  sensitive   = true
  description = "Stripe webhook signing secret"
}

variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT signing secret"
}
