# Security Group — allow PostgreSQL only from backend ECS tasks
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-sg"
  description = "Allow PostgreSQL from backend ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.backend_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-rds-sg" }
}

# Subnet Group — private subnets across 2 AZs
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = { Name = "${var.app_name}-db-subnet-group" }
}

# Parameter Group — PostgreSQL 15 defaults
resource "aws_db_parameter_group" "main" {
  name   = "${var.app_name}-pg15"
  family = "postgres15"

  tags = { Name = "${var.app_name}-pg15" }
}

# RDS PostgreSQL 15 instance
resource "aws_db_instance" "main" {
  identifier        = "${var.app_name}-postgres"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"
  storage_encrypted = true

  db_name  = "jwtauth"
  username = "psqladmin"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  multi_az               = false   # single-AZ for cost — enable for production
  publicly_accessible    = false
  deletion_protection    = false
  skip_final_snapshot    = true
  backup_retention_period = 7

  tags = { Name = "${var.app_name}-postgres" }
}
