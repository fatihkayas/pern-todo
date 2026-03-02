output "alb_dns_name" {
  description = "ALB DNS name — open in browser to access the app"
  value       = module.alb.alb_dns_name
}

output "ecr_backend_url" {
  description = "ECR repository URL for seiko-backend"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for seiko-frontend"
  value       = module.ecr.frontend_repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = module.rds.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "github_actions_role_arn" {
  description = "AWS IAM role ARN for GitHub Actions OIDC — add as AWS_ROLE_ARN secret"
  value       = module.ecs.github_actions_role_arn
}
