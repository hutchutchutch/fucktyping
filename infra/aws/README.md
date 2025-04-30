# AWS Deployment Infrastructure

This directory contains Terraform configurations for deploying the FuckTyping application to AWS using ECS (Fargate) and RDS PostgreSQL.

## Architecture Overview

The infrastructure consists of:

1. **VPC** - A Virtual Private Cloud with public, private, and database subnets across multiple availability zones.
2. **RDS PostgreSQL** - A managed PostgreSQL database for storing application data.
3. **ECS Fargate** - Containerized deployment of backend and frontend services.
4. **Application Load Balancer** - Routes traffic to appropriate services.
5. **ECR Repositories** - For storing container images.
6. **Secrets Manager** - Securely store and retrieve sensitive information.

## Prerequisites

- AWS CLI installed and configured
- Terraform v1.6.0 or later
- Docker
- A domain name (for setting up HTTPS)

## Environment Setup

Create a `.env` file in this directory with the following variables:

```
AWS_REGION=us-west-2
ENV=dev
DB_USERNAME=yourdbuser
DB_PASSWORD=yoursecurepassword
GROQ_API_KEY=your-groq-api-key
```

## Deployment Steps

1. First, ensure you have the necessary permissions to create AWS resources:

   ```bash
   aws sts get-caller-identity
   ```

2. Initialize the S3 backend (one-time setup):

   ```bash
   aws s3 mb s3://fucktyping-terraform-state --region us-west-2
   aws dynamodb create-table \
     --table-name fucktyping-terraform-locks \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-west-2
   ```

3. Run the deployment script:

   ```bash
   ./deploy.sh
   ```

   This script will:
   - Apply the Terraform configuration
   - Build and push Docker images to ECR
   - Output the application URLs

## Terraform Modules

- **vpc** - Sets up networking infrastructure
- **rds** - Provisions PostgreSQL database
- **ecs** - Sets up container services
- **load-balancer** - Configures application load balancer
- **secrets** - Manages sensitive information

## Production Deployment Considerations

For production deployments:
- Set `ENV=production` to enable high-availability features
- Use stronger instance types for RDS and ECS
- Consider adding CloudFront for CDN capabilities
- Set up enhanced monitoring and alarms
- Configure automated backups and disaster recovery
- Implement CI/CD pipeline for automated deployments

## Cleanup

To destroy all resources:

```bash
terraform destroy -var-file=dev.tfvars
```

**Warning**: This will permanently delete all resources, including the database. Make sure to back up any important data first.

## Troubleshooting

Common issues:
- **Deployment Failure**: Check CloudWatch logs for ECS services
- **Database Connection Issues**: Verify security group rules
- **Container Startup Failures**: Check the container logs in CloudWatch