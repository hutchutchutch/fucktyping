provider "aws" {
  region = var.aws_region
}

resource "aws_db_subnet_group" "fucktyping_db_subnet_group" {
  name       = "fucktyping-db-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = {
    Name = "FuckTyping DB Subnet Group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "fucktyping-rds-sg"
  description = "Allow database traffic for FuckTyping"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fucktyping-rds-sg"
  }
}

resource "aws_db_instance" "fucktyping_postgres" {
  identifier             = "fucktyping-postgres"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.db_instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = var.max_allocated_storage
  storage_type           = "gp3"
  db_name                = "fucktyping"
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = "default.postgres15"
  backup_retention_period = 7
  storage_encrypted      = true
  multi_az               = var.multi_az
  publicly_accessible    = false
  skip_final_snapshot    = false
  final_snapshot_identifier = "fucktyping-final-snapshot"
  db_subnet_group_name   = aws_db_subnet_group.fucktyping_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  deletion_protection    = true

  tags = {
    Name = "FuckTyping PostgreSQL Database"
  }
}

output "rds_hostname" {
  description = "RDS instance hostname"
  value       = aws_db_instance.fucktyping_postgres.address
  sensitive   = false
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.fucktyping_postgres.port
  sensitive   = false
}

output "rds_username" {
  description = "RDS instance username"
  value       = aws_db_instance.fucktyping_postgres.username
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.fucktyping_postgres.db_name
  sensitive   = false
}