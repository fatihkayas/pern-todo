variable "app_name" {
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_sg_id" {
  type = string
}

variable "backend_sg_id" {
  description = "Backend ECS SG — created in root module to avoid circular dep with RDS"
  type        = string
}

variable "frontend_sg_id" {
  description = "Frontend ECS SG — created in root module"
  type        = string
}

variable "backend_target_group_arn" {
  type = string
}

variable "frontend_target_group_arn" {
  type = string
}

variable "backend_image" {
  type = string
}

variable "frontend_image" {
  type = string
}

variable "rds_endpoint" {
  type = string
}

variable "db_password_secret_arn" {
  type = string
}

variable "stripe_secret_key_arn" {
  type = string
}

variable "stripe_webhook_secret_arn" {
  type = string
}

variable "jwt_secret_arn" {
  type = string
}

variable "backend_log_group" {
  type = string
}

variable "frontend_log_group" {
  type = string
}
