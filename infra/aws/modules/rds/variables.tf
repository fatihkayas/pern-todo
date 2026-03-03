variable "app_name" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "public_subnet_ids" {
  description = "Public subnet IDs — used temporarily when publicly_accessible = true"
  type        = list(string)
}

variable "vpc_id" {
  type = string
}

variable "backend_sg_id" {
  type = string
}
