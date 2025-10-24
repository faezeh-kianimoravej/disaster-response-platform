# Environment Variable Usage Checklist & Recommendations

## Checklist
- [x] All sensitive values (DB credentials, service URLs) are set via environment variables in Docker Compose
- [x] Spring Boot configs use `${VAR_NAME:default}` syntax for environment variable overrides
- [x] No hardcoded secrets or endpoints in source code or config files
- [x] Docker Compose and ECS task definitions inject environment variables at runtime
- [x] All services can be configured for local or AWS endpoints by changing environment variables
- [ ] Document all required environment variables in `README.md` or a `.env.example` file
- [ ] Use AWS Secrets Manager or SSM Parameter Store for sensitive values in production
- [ ] Ensure CI/CD pipeline (GitLab) passes environment variables securely to AWS deployments
- [ ] Use consistent variable names across services (e.g., `SPRING_DATASOURCE_URL`, `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE`)
- [ ] Validate that all configs support environment variable overrides (Spring Boot, Kafka, Eureka, etc.)

## Recommendations
- **Centralize Documentation:** List all required environment variables and their purpose in your project documentation.
- **Use Default Values:** Where possible, provide sensible defaults in config files (e.g., `${VAR_NAME:default}`) for easier local development.
- **Secrets Management:** For production, store secrets in AWS Secrets Manager or SSM Parameter Store and inject them into ECS tasks.
- **CI/CD Integration:** Ensure your GitLab pipeline can pass environment variables to build and deploy steps securely.
- **Consistent Naming:** Use the same variable names across all services to reduce confusion and errors.
- **Config Validation:** Periodically audit configs to ensure no hardcoded secrets or endpoints remain.
- **Local vs. Production:** Use `.env` files for local development and environment variables/parameter store for AWS.
- **Sensitive Data:** Never commit secrets or sensitive values to version control.

---

Following these practices will ensure your services remain portable, secure, and easy to configure for both local and AWS environments.
