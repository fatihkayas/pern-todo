output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC — set as AWS_ROLE_ARN secret"
  value       = aws_iam_role.github_actions.arn
}
