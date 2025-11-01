# Backend Services

Microservices backend for the DRCCS system using Spring Boot, Docker, and PostgreSQL.

---

## Prerequisites

- ☕ **Java 21** (for backend builds)
- 🧰 **Apache Maven 3.8+** (for building the backend services)
- 🐳 **Docker Desktop** (must be running)

---

## 🚀 Quick Start

### Normal Start (Daily Use)
```powershell
docker-compose up -d
```

### Fresh Rebuild (First Time / After Changes)

**With Maven installed:**
```powershell
mvn clean package -DskipTests
docker-compose down -v; docker-compose build --no-cache; docker-compose up -d
```

**With IntelliJ:**
1. Open Maven sidebar (View → Tool Windows → Maven)
2. Expand root project → Lifecycle → Run `clean` then `package`
3. Run in terminal:
```powershell
docker-compose down -v; docker-compose build --no-cache; docker-compose up -d
```

**Use fresh rebuild when:**
- First time setup
- After pulling changes
- Old/stale Docker images
- Database issues

### Stop Services
```powershell
docker-compose down
```

---

## Service URLs

| Service | URL | Port |
|---------|-----|------|
| Eureka Dashboard | http://localhost:8761 | 8761 |
| API Gateway | http://localhost:8080 | 8080 |
| Department Service | http://localhost:8081 | 8081 |
| Municipality Service | http://localhost:8082 | 8082 |
| Region Service | http://localhost:8083 | 8083 |
| Incident Service | http://localhost:8084 | 8084 |
| PostgreSQL | localhost:5432 | 5432 |


---

## Profiles

This repository uses three runtime profiles. Keep the profile selection centralized (we use the `STACK_PROFILE`/Docker Compose mechanism for local runs and your task definition / environment for prod).

- local-single: Run one service locally for quick development without starting the full stack. It disables service discovery (Eureka) and uses localhost for Kafka and PostgreSQL. Use this when you want to iterate on a single service and connect to a local database instance.

- local-docker: Run the entire backend locally via Docker Compose. Uses container hostnames for dependencies (Postgres container `postgres-db`, Kafka `kafka`, discovery `discovery-service`). This is the recommended profile for full-stack local testing.

- prod: Production settings for AWS/ECS. Config points to the DRCCS production hosts (RDS, prod Kafka, discovery-service.drccs.local). Secrets (database username/password) are not stored in the repo — they must be supplied at runtime by the secrets manager / task definition.

Required environment variables (prod)
- `SPRING_DATASOURCE_USERNAME` — DB username (supplied from Secrets Manager).
- `SPRING_DATASOURCE_PASSWORD` — DB password (supplied from Secrets Manager).

Local defaults
- For local usage (both `local-single` and `local-docker`) the default DB username/password used by the compose/dev setup is `postgres` / `1234`. In prod, credentials are injected at runtime.

---

## Common Commands

```powershell
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f incident-service

# Check service status
docker-compose ps

# Rebuild one service
docker-compose up -d --build incident-service

# Clean everything (removes volumes)
docker-compose down -v
```

---

## Troubleshooting
**Rebuild and Run Single Service:**
```powershell
docker-compose up -d --build service-name
``` 

**Port already in use:**
```powershell
docker-compose down
```

**Old code still running:**
```powershell
docker-compose down -v; docker-compose build --no-cache; docker-compose up -d
```

**Database connection issues:**
Wait 30 seconds for PostgreSQL to initialize, then check logs:
```powershell
docker-compose logs postgres-db
```
