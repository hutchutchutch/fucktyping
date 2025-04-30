provider "aws" {
  region = var.aws_region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.38.0"
    }
  }

  backend "s3" {
    bucket         = "fucktyping-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "fucktyping-terraform-locks"
  }

  required_version = ">= 1.6.0"
}

locals {
  common_tags = {
    Project     = "FuckTyping"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

module "vpc" {
  source = "./vpc"
  
  aws_region  = var.aws_region
  environment = var.environment
}

module "load_balancer" {
  source = "./load-balancer"
  
  aws_region        = var.aws_region
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  domain_name       = var.domain_name
}

module "rds" {
  source = "./rds"
  
  aws_region            = var.aws_region
  vpc_id                = module.vpc.vpc_id
  database_subnet_ids   = module.vpc.database_subnet_ids
  ecs_security_group_id = module.ecs.ecs_security_group_id
  db_instance_class     = var.db_instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  db_username           = var.db_username
  db_password           = var.db_password
  multi_az              = var.environment == "production" ? true : false
}

module "ecs" {
  source = "./ecs"
  
  aws_region               = var.aws_region
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  backend_target_group_arn = module.load_balancer.backend_target_group_arn
  frontend_target_group_arn = module.load_balancer.frontend_target_group_arn
  rds_hostname             = module.rds.rds_hostname
  rds_port                 = module.rds.rds_port
  rds_database_name        = module.rds.rds_database_name
  db_secrets_arn           = module.secrets.db_credentials_arn
  groq_api_key_arn         = module.secrets.groq_api_key_arn
  secrets_arns             = module.secrets.secrets_arns
  backend_url              = "https://${var.domain_name}/api"
  
  # Adjustable parameters based on environment
  backend_cpu             = var.environment == "production" ? 1024 : 512
  backend_memory          = var.environment == "production" ? 2048 : 1024
  frontend_cpu            = var.environment == "production" ? 512 : 256
  frontend_memory         = var.environment == "production" ? 1024 : 512
  backend_desired_count   = var.environment == "production" ? 2 : 1
  frontend_desired_count  = var.environment == "production" ? 2 : 1
}

module "secrets" {
  source = "./secrets"
  
  aws_region   = var.aws_region
  environment  = var.environment
  db_username  = var.db_username
  db_password  = var.db_password
  groq_api_key = var.groq_api_key
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.load_balancer.alb_dns_name
}

output "backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = module.ecs.backend_repository_url
}

output "frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = module.ecs.frontend_repository_url
}

output "rds_hostname" {
  description = "RDS instance hostname"
  value       = module.rds.rds_hostname
}