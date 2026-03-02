resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.app_name}/db-password"
  description             = "RDS PostgreSQL admin password"
  recovery_window_in_days = 0  # immediate deletion (set to 7 for production)

  tags = { Name = "${var.app_name}/db-password" }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

resource "aws_secretsmanager_secret" "stripe_secret_key" {
  name                    = "${var.app_name}/stripe-secret-key"
  description             = "Stripe secret key"
  recovery_window_in_days = 0

  tags = { Name = "${var.app_name}/stripe-secret-key" }
}

resource "aws_secretsmanager_secret_version" "stripe_secret_key" {
  secret_id     = aws_secretsmanager_secret.stripe_secret_key.id
  secret_string = var.stripe_secret_key
}

resource "aws_secretsmanager_secret" "stripe_webhook_secret" {
  name                    = "${var.app_name}/stripe-webhook-secret"
  description             = "Stripe webhook signing secret"
  recovery_window_in_days = 0

  tags = { Name = "${var.app_name}/stripe-webhook-secret" }
}

resource "aws_secretsmanager_secret_version" "stripe_webhook_secret" {
  secret_id     = aws_secretsmanager_secret.stripe_webhook_secret.id
  secret_string = var.stripe_webhook_secret
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.app_name}/jwt-secret"
  description             = "JWT signing secret"
  recovery_window_in_days = 0

  tags = { Name = "${var.app_name}/jwt-secret" }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}
