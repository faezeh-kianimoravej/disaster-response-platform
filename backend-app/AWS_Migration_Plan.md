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

## Migration Progress & Resources Created (as of 2025-10-24)


### Progress Summary (as of 2025-10-25)
- Docker images for all backend services have been built and tested locally.
- AWS resources provisioned:
  - VPC and subnets (10.0.0.0/16, public subnets for ECS tasks)
  - Amazon RDS (PostgreSQL) for production database
  - Amazon ECR repositories for all services
  - ECS cluster (drccs-backend-cluster) and Fargate services deployed
  - AWS Secrets Manager secret for DB credentials (`drccs-db-credentials`)
  - VPC Endpoint for Secrets Manager (interface endpoint, Private DNS enabled)
  - Security groups configured for database and ECS networking
- Database migrated to RDS and services configured to use RDS endpoint
- ECS services initially failed to pull secrets from Secrets Manager due to VPC endpoint security group rules; resolved by adding inbound rule to VPC endpoint security group to allow TCP 443 from VPC CIDR (10.0.0.0/16)
- Subnet route tables and IGW/NAT configuration fixed to allow ECS tasks internet access and ECR pulls
- CloudWatch log groups created for all ECS services
- Task definitions updated for Eureka registration and health check tuning
- Discovery-service (Eureka) health check failures resolved by:
  - Exposing actuator health endpoint
  - Ensuring server binds to 0.0.0.0
  - Opening required ports in security group
  - Removing ECS container health checks (now rely on process status)
- Discovery-service now starts and remains healthy; logs confirm successful startup
- Other services updated to bind to 0.0.0.0 for container compatibility
- API Gateway currently unable to register with Eureka due to service DNS resolution; will address in next session

### Troubleshooting & Key Learnings
- If using a VPC endpoint for Secrets Manager, ensure its security group allows inbound TCP 443 from ECS tasks/subnets
- Outbound rules for ECS task security groups must allow all traffic (default)
- Subnet route tables must provide internet access (via IGW for public, NAT for private)
- IAM roles (ecsTaskExecutionRole) must have SecretsManager and KMS permissions
- ECS health checks can block service startup if actuator endpoints are not exposed or not reachable; binding to 0.0.0.0 is required in containers
- Removing ECS health checks is a valid workaround if process status is sufficient for your use case
- Eureka registration requires correct service discovery DNS or internal IP; ECS Service Discovery (Cloud Map) is recommended for production

### Outstanding Tasks
- Update CI/CD pipeline for automated deploys
- Set up CloudWatch monitoring and alerting
- Finalize security hardening and documentation
- Fix API Gateway Eureka registration (update Eureka client URL to use correct DNS or Cloud Map)

---

## Checklist
- [x] Docker images build and run locally
- [x] AWS resources created (VPC, RDS, ECR, ECS, Secrets Manager, VPC Endpoint)
- [x] Images pushed to ECR
- [x] ECS services deployed (API Gateway, microservices)
- [x] Database migrated to RDS
- [ ] CI/CD pipeline updated
- [x] Local development environment intact
- [ ] Monitoring and security configured
