AWS Migration Plan
Migration Update: 2025-10-25
Current Status & Progress
Application Load Balancer (ALB): Set up and provides a stable DNS endpoint for the api-gateway.
ECS Services: All backend services are running as separate ECS tasks with awsvpc network mode.
Service Discovery: AWS Cloud Map is enabled for all services, allowing DNS-based service-to-service communication within the VPC.
Eureka Configuration: All services use eureka.instance.prefer-ip-address=false and eureka.instance.hostname=<service-name> in both application properties and ECS environment variables.
Security Groups: Configured to allow internal VPC traffic on all service ports (8080–8085).
Gateway Routing: api-gateway is configured to use service names (e.g., lb://region-service) for routing.
Service Health: All services show as UP in the Eureka dashboard, but all are registered with the same internal IP (expected for Fargate/awsvpc mode).
Container Hostnames: Confirmed that direct container hostname setting is not supported in awsvpc mode; removed unsupported hostname fields from task definitions.
DNS Resolution: Verified that Cloud Map DNS names resolve correctly for all services within the VPC.
Current Challenge: 503 Errors on Gateway Routing
Requests routed through the api-gateway (via ALB) to backend services (e.g., /api/regions, /api/departments) return HTTP 503 with a fallback response.
This indicates the api-gateway cannot reach the backend services at runtime, even though service discovery and registration appear correct.
All checklist items for AWS ECS, ALB, Eureka, and Cloud Map integration have been completed and verified.
The root cause may be related to how Eureka and/or Spring Cloud Gateway resolve service addresses in Fargate/awsvpc mode, or a subtle networking issue not visible in the current configuration.
Next Steps
Review api-gateway logs in CloudWatch for detailed error messages when routing to backend services.
Enable debug logging for Spring Cloud Gateway and Eureka client to gather more details.
Investigate if additional configuration is needed for Eureka/Cloud Map integration in Fargate.
Seek AWS or Spring Cloud community support if the issue persists after further investigation.
Historical Progress & Resources Created
Kafka: Will be provided by Amazon MSK (Managed Streaming for Apache Kafka) in AWS.
ECS Service Discovery (Cloud Map): Namespace drccs.local created and enabled for all ECS services.
Task Definitions: Updated to use Cloud Map DNS names for Eureka registration (e.g., http://discovery-service.drccs.local:8761/eureka/).
Docker Images: Built and tested locally for all backend services.
AWS Resources Provisioned:
VPC and subnets (10.0.0.0/16, public subnets for ECS tasks)
Amazon RDS (PostgreSQL) for production database
Amazon ECR repositories for all services
ECS cluster (drccs-backend-cluster) and Fargate services deployed
AWS Secrets Manager secret for DB credentials (drccs-db-credentials)
VPC Endpoint for Secrets Manager (interface endpoint, Private DNS enabled)
Security groups for database and ECS networking
Database Migration: Migrated to RDS and services configured to use RDS endpoint.
Secrets Manager: ECS tasks now pull secrets from Secrets Manager after fixing VPC endpoint security group rules.
Networking: Subnet route tables and IGW/NAT configuration fixed to allow ECS tasks internet access and ECR pulls.
CloudWatch Logs: Log groups created for all ECS services.
Health Checks: Task definitions updated for Eureka registration and health check tuning.
Discovery-service (Eureka): Health check failures resolved by exposing actuator health endpoint, binding to 0.0.0.0, and opening required ports in security group.
Other Services: Updated to bind to 0.0.0.0 for container compatibility.
Troubleshooting & Key Learnings
VPC endpoint for Secrets Manager must allow inbound TCP 443 from ECS tasks/subnets.
Outbound rules for ECS task security groups must allow all traffic (default).
Subnet route tables must provide internet access (via IGW for public, NAT for private).
IAM roles (ecsTaskExecutionRole) must have SecretsManager and KMS permissions.
ECS health checks can block service startup if actuator endpoints are not exposed or not reachable; binding to 0.0.0.0 is required in containers.
Removing ECS health checks is a valid workaround if process status is sufficient for your use case.
Eureka registration requires correct service discovery DNS or internal IP; ECS Service Discovery (Cloud Map) is recommended for production.
Direct container hostname setting is not supported in Fargate/awsvpc mode.
Outstanding Tasks
Update CI/CD pipeline for automated deploys.
Set up CloudWatch monitoring and alerting.
Finalize security hardening and documentation.
Monitor service registration in Eureka dashboard and verify inter-service communication.
Resolve 503 errors on gateway routing.