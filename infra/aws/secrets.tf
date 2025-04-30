provider "aws" {
  region = var.aws_region
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "fucktyping/db-credentials"
  description = "Database credentials for FuckTyping application"

  tags = {
    Environment = var.environment
    Project     = "FuckTyping"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
  })
}

resource "aws_secretsmanager_secret" "groq_api_key" {
  name        = "fucktyping/groq-api-key"
  description = "GROQ API key for FuckTyping application"

  tags = {
    Environment = var.environment
    Project     = "FuckTyping"
  }
}

resource "aws_secretsmanager_secret_version" "groq_api_key_version" {
  secret_id     = aws_secretsmanager_secret.groq_api_key.id
  secret_string = jsonencode({
    GROQ_API_KEY = var.groq_api_key
  })
}

output "db_credentials_arn" {
  description = "ARN of database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "groq_api_key_arn" {
  description = "ARN of GROQ API key secret"
  value       = aws_secretsmanager_secret.groq_api_key.arn
}

output "secrets_arns" {
  description = "List of all secret ARNs"
  value       = [
    aws_secretsmanager_secret.db_credentials.arn,
    aws_secretsmanager_secret.groq_api_key.arn
  ]
}