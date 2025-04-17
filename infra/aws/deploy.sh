#!/bin/bash
set -e

# Setup colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

# Set environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${YELLOW}Warning: .env file not found. Make sure all required environment variables are set.${NC}"
fi

# Verify required environment variables
required_vars=("AWS_REGION" "ENV" "DB_USERNAME" "DB_PASSWORD" "GROQ_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var environment variable is not set.${NC}"
        exit 1
    fi
done

# Initialize Terraform
echo -e "${GREEN}Initializing Terraform...${NC}"
cd "$(dirname "$0")"
terraform init

# Apply Terraform configuration
echo -e "${GREEN}Applying Terraform configuration...${NC}"
terraform apply -var "aws_region=${AWS_REGION}" \
                -var "environment=${ENV}" \
                -var "db_username=${DB_USERNAME}" \
                -var "db_password=${DB_PASSWORD}" \
                -var "groq_api_key=${GROQ_API_KEY}"

# Get ECR repository URLs from Terraform outputs
echo -e "${GREEN}Getting ECR repository URLs...${NC}"
backend_repo=$(terraform output -raw backend_repository_url)
frontend_repo=$(terraform output -raw frontend_repository_url)

# Log in to ECR
echo -e "${GREEN}Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${backend_repo%/*}

# Build and push backend image
echo -e "${GREEN}Building and pushing backend image...${NC}"
cd ../../apps/backend
docker build -t ${backend_repo}:latest -f Dockerfile .
docker push ${backend_repo}:latest

# Build and push frontend image
echo -e "${GREEN}Building and pushing frontend image...${NC}"
cd ../frontend
docker build -t ${frontend_repo}:latest -f Dockerfile .
docker push ${frontend_repo}:latest

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Backend application URL: https://$(terraform output -raw alb_dns_name)/api"
echo -e "Frontend application URL: https://$(terraform output -raw alb_dns_name)"