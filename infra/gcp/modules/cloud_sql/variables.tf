variable "app_name" {
  type = string
}

variable "region" {
  type = string
}

variable "project_id" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}
