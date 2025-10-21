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
