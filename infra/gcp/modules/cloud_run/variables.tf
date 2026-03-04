variable "app_name" {
  type = string
}

variable "region" {
  type = string
}

variable "project_id" {
  type = string
}

variable "registry" {
  type        = string
  description = "Artifact Registry repository URL prefix"
}

variable "service_account_email" {
  type        = string
  description = "Service account email for Cloud Run tasks"
}

variable "cloud_sql_connection_name" {
  type        = string
  description = "Cloud SQL instance connection name (project:region:instance)"
}

variable "db_password_secret_id" {
  type = string
}

variable "stripe_secret_id" {
  type = string
}

variable "stripe_webhook_secret_id" {
  type = string
}

variable "jwt_secret_id" {
  type = string
}
