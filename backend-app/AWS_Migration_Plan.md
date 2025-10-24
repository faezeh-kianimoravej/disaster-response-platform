# AWS Migration Plan for DRCCS Backend

## Goals
- Host all backend services on AWS using containers
- Use existing Eureka and Kafka services (self-hosted)
- Migrate PostgreSQL database to AWS RDS
- Maintain local development environment (Docker Compose)
- Release via GitLab CI/CD pipeline

---

## Step-by-Step Migration Guide

### 1. Preparation
- Audit all service Dockerfiles and ensure they build and run correctly
- Tag and version Docker images for each service
- Ensure all environment variables are externalized (for AWS secrets management)

### 2. AWS Resource Setup
- Create an AWS VPC and subnets for backend services
- Set up Amazon RDS (PostgreSQL) for production database
- Create Amazon ECR repositories for each service
- Set up IAM roles for ECS tasks and GitLab pipeline

### 3. Containerization & Image Push
- Build Docker images for all services (including Eureka and Kafka)
- Push images to Amazon ECR

### 4. ECS Cluster & Service Deployment
- Create an ECS cluster (Fargate or EC2 launch type)
- Define ECS task definitions for each service
- Deploy Eureka and Kafka as containers in ECS
- Deploy all microservices and API Gateway as ECS services
- Configure service networking (same VPC, private subnets)

### 5. Database Migration
- Dump local PostgreSQL data and import into RDS
- Update service configs to use RDS endpoint
- Store DB credentials in AWS Secrets Manager or SSM Parameter Store

### 6. Service Discovery & Messaging
- Ensure Eureka is accessible to all services in the VPC
- Ensure Kafka is accessible to incident and notification services
- Update service configs to use internal VPC hostnames

### 7. API Gateway Setup
- Deploy your API Gateway service as a container in ECS
- Optionally, set up AWS API Gateway for external routing
- Configure security groups and load balancer for public access

### 8. CI/CD Pipeline (GitLab)
- Update `.gitlab-ci.yml` to build, tag, and push Docker images to ECR
- Add deployment steps to ECS using AWS CLI or ECS deploy tools
- Store AWS credentials securely in GitLab CI/CD variables

### 9. Local Development Environment
- Keep Docker Compose setup for local development
- Use environment variables to switch between local and AWS endpoints
- Document differences in `README.md`

### 10. Monitoring & Logging
- Set up CloudWatch for ECS logs and metrics
- Configure health checks and auto-scaling policies

### 11. Security & Maintenance
- Use IAM roles for least privilege
- Set up backups for RDS
- Regularly update Docker images and dependencies

---

## Notes
- All services should use environment variables for configuration
- Use AWS Secrets Manager for sensitive data
- Document all endpoints and credentials for team reference

---

## Checklist
- [ ] Docker images build and run locally
- [ ] AWS resources created (VPC, RDS, ECR, ECS)
- [ ] Images pushed to ECR
- [ ] ECS services deployed
- [ ] Database migrated
- [ ] CI/CD pipeline updated
- [ ] Local development environment intact
- [ ] Monitoring and security configured

---

## References
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/latest/developerguide/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/index.html)
- [GitLab CI/CD with AWS](https://docs.gitlab.com/ee/ci/cloud_services/aws/)
