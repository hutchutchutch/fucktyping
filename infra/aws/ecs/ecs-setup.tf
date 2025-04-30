provider "aws" {
  region = var.aws_region
}

resource "aws_ecr_repository" "backend_repo" {
  name                 = "fucktyping-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend_repo" {
  name                 = "fucktyping-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/fucktyping"
  retention_in_days = 30
}

resource "aws_security_group" "ecs_tasks_sg" {
  name        = "fucktyping-ecs-tasks-sg"
  description = "Allow inbound traffic for FuckTyping ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  ingress {
    from_port       = 5173
    to_port         = 5173
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fucktyping-ecs-tasks-sg"
  }
}

resource "aws_ecs_cluster" "fucktyping_cluster" {
  name = "fucktyping-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "fucktyping-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "fucktyping-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "secrets_manager_access" {
  name = "secrets-manager-access"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
        ]
        Effect   = "Allow"
        Resource = var.secrets_arns
      }
    ]
  })
}

# Task definition for backend service
resource "aws_ecs_task_definition" "backend_task" {
  family                   = "fucktyping-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "fucktyping-backend"
      image     = "${aws_ecr_repository.backend_repo.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" },
        { name = "RDS_HOSTNAME", value = var.rds_hostname },
        { name = "RDS_PORT", value = tostring(var.rds_port) },
        { name = "RDS_DB_NAME", value = var.rds_database_name }
      ]
      
      secrets = [
        { name = "RDS_USERNAME", valueFrom = var.db_secrets_arn },
        { name = "RDS_PASSWORD", valueFrom = var.db_secrets_arn },
        { name = "GROQ_API_KEY", valueFrom = var.groq_api_key_arn }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# Task definition for frontend service
resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "fucktyping-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "fucktyping-frontend"
      image     = "${aws_ecr_repository.frontend_repo.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "BACKEND_URL", value = var.backend_url }
      ]
      
      secrets = [
        { name = "GROQ_API_KEY", valueFrom = var.groq_api_key_arn }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

# ECS services
resource "aws_ecs_service" "backend_service" {
  name            = "fucktyping-backend-service"
  cluster         = aws_ecs_cluster.fucktyping_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "fucktyping-backend"
    container_port   = 3000
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution_role_policy
  ]
}

resource "aws_ecs_service" "frontend_service" {
  name            = "fucktyping-frontend-service"
  cluster         = aws_ecs_cluster.fucktyping_cluster.id
  task_definition = aws_ecs_task_definition.frontend_task.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "fucktyping-frontend"
    container_port   = 80
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution_role_policy
  ]
}

output "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs_tasks_sg.id
}

output "backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend_repo.repository_url
}

output "frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend_repo.repository_url
}