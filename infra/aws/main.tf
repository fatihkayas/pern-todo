terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ── VPC ──────────────────────────────────────────────────────────────────────
module "vpc" {
  source   = "./modules/vpc"
  app_name = var.app_name
  region   = var.region
}

# ── ECR ──────────────────────────────────────────────────────────────────────
module "ecr" {
  source   = "./modules/ecr"
  app_name = var.app_name
}

# ── ALB ───────────────────────────────────────────────────────────────────────
module "alb" {
  source            = "./modules/alb"
  app_name          = var.app_name
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}

# ── ECS security groups (created before RDS to break circular dependency) ─────
# Backend SG: allow 5000 from ALB
resource "aws_security_group" "backend" {
  name        = "${var.app_name}-backend-sg"
  description = "Backend ECS tasks - allow from ALB on port 5000"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [module.alb.alb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-backend-sg" }
}

# Frontend SG: allow 3000 from ALB
resource "aws_security_group" "frontend" {
  name        = "${var.app_name}-frontend-sg"
  description = "Frontend ECS tasks - allow from ALB on port 3000"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [module.alb.alb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-frontend-sg" }
}

# ── Secrets Manager ───────────────────────────────────────────────────────────
module "secrets" {
  source                = "./modules/secrets"
  app_name              = var.app_name
  db_password           = var.db_password
  stripe_secret_key     = var.stripe_secret_key
  stripe_webhook_secret = var.stripe_webhook_secret
  jwt_secret            = var.jwt_secret
}

# ── RDS PostgreSQL ────────────────────────────────────────────────────────────
module "rds" {
  source             = "./modules/rds"
  app_name           = var.app_name
  db_password        = var.db_password
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids   # TEMPORARY for migration access
  vpc_id             = module.vpc.vpc_id
  backend_sg_id      = aws_security_group.backend.id
}

# ── CloudWatch ────────────────────────────────────────────────────────────────
# Created before ECS so log group names are available for task definitions
module "cloudwatch" {
  source           = "./modules/cloudwatch"
  app_name         = var.app_name
  region           = var.region
  ecs_cluster_name = "${var.app_name}-cluster" # known before ECS apply
  alb_arn_suffix   = module.alb.alb_arn_suffix
  rds_identifier   = "${var.app_name}-postgres" # known before RDS apply
}

# ── ECS Fargate ───────────────────────────────────────────────────────────────
module "ecs" {
  source                    = "./modules/ecs"
  app_name                  = var.app_name
  region                    = var.region
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  alb_sg_id                 = module.alb.alb_sg_id
  backend_sg_id             = aws_security_group.backend.id
  frontend_sg_id            = aws_security_group.frontend.id
  backend_target_group_arn  = module.alb.backend_target_group_arn
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_image             = "${module.ecr.backend_repository_url}:latest"
  frontend_image            = "${module.ecr.frontend_repository_url}:latest"
  rds_endpoint              = module.rds.host
  db_password_secret_arn    = module.secrets.db_password_arn
  stripe_secret_key_arn     = module.secrets.stripe_secret_key_arn
  stripe_webhook_secret_arn = module.secrets.stripe_webhook_secret_arn
  jwt_secret_arn            = module.secrets.jwt_secret_arn
  backend_log_group         = module.cloudwatch.backend_log_group
  frontend_log_group        = module.cloudwatch.frontend_log_group
}
