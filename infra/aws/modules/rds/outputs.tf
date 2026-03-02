output "endpoint" {
  description = "RDS endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
}

output "host" {
  description = "RDS hostname only (without port)"
  value       = aws_db_instance.main.address
}

output "identifier" {
  description = "RDS instance identifier (for CloudWatch)"
  value       = aws_db_instance.main.identifier
}
