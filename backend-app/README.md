# Backend Services

Microservices backend for the DRCCS system using Spring Boot, Docker, and PostgreSQL.

---

## Prerequisites

- **Java 21** - for building services
- **Docker Desktop** - must be running

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

**PostgreSQL Credentials:**
- Username: `postgres`
- Password: `1234`

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

---

## Environment Variables

See `.env.example` for a full list of required environment variables and their usage for local and AWS deployments.

| Variable                              | Description                                 |
|----------------------------------------|---------------------------------------------|
| SPRING_PROFILES_ACTIVE                 | Spring Boot profile (e.g., prod)            |
| SPRING_DATASOURCE_URL                  | JDBC URL for PostgreSQL                     |
| SPRING_DATASOURCE_USERNAME             | Database username                           |
| SPRING_DATASOURCE_PASSWORD             | Database password                           |
| SPRING_JPA_HIBERNATE_DDL_AUTO          | Hibernate DDL mode                          |
| SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT| Hibernate dialect                           |
| EUREKA_CLIENT_SERVICEURL_DEFAULTZONE   | Eureka server URL                           |
| EUREKA_INSTANCE_PREFER_IP_ADDRESS      | Prefer IP address for Eureka registration   |
| EUREKA_INSTANCE_HOSTNAME               | Service hostname for Eureka                 |
| SPRING_KAFKA_BOOTSTRAP_SERVERS         | Kafka broker address                        |
| POSTGRES_USER                          | PostgreSQL username                         |
| POSTGRES_PASSWORD                      | PostgreSQL password                         |
| POSTGRES_DB                            | Default database name                       |
| SPRING_APPLICATION_NAME                | Service name (notification-service)         |
| SERVER_PORT                            | Service port (notification-service)         |

---

For AWS deployments, use ECS task definitions or AWS Secrets Manager/SSM Parameter Store for sensitive values.
