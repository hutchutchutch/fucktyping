variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "vpc_id" {
  description = "VPC ID where ECS resources will be deployed"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "backend_target_group_arn" {
  description = "ARN of the backend target group"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "ARN of the frontend target group"
  type        = string
}

variable "rds_hostname" {
  description = "RDS instance hostname"
  type        = string
}

variable "rds_port" {
  description = "RDS instance port"
  type        = number
  default     = 5432
}

variable "rds_database_name" {
  description = "RDS database name"
  type        = string
  default     = "fucktyping"
}

variable "db_secrets_arn" {
  description = "ARN of the secret containing database credentials"
  type        = string
}

variable "groq_api_key_arn" {
  description = "ARN of the secret containing the GROQ API key"
  type        = string
}

variable "secrets_arns" {
  description = "List of ARNs for secrets that the ECS task can access"
  type        = list(string)
}

variable "backend_url" {
  description = "URL for the backend service"
  type        = string
}

variable "backend_cpu" {
  description = "CPU units for the backend container (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "backend_memory" {
  description = "Memory for the backend container in MB"
  type        = number
  default     = 2048
}

variable "frontend_cpu" {
  description = "CPU units for the frontend container (512 = 0.5 vCPU)"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Memory for the frontend container in MB"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired count of backend tasks"
  type        = number
  default     = 2
}

variable "frontend_desired_count" {
  description = "Desired count of frontend tasks"
  type        = number
  default     = 2
}