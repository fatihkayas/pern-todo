variable "app_name" {
  description = "Application name prefix for all resources"
  type        = string
  default     = "seiko"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "db_password" {
  description = "RDS PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (64 bytes)"
  type        = string
  sensitive   = true
}
