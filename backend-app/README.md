
# Backend Services

This folder contains all backend microservices and the Docker Compose setup for local development.

---

## Architecture

- **discovery-service** (Eureka) - Service registry on port 8761
- **api-gateway** - Unified API entry point on port 8080
- **department-service** - Emergency department management on port 8081
- **municipality-service** - Municipality management on port 8082
- **incident-service** - Incident tracking (future)
- **location-service** - Geo/location data (future)
- **postgres-db** - Shared PostgreSQL database on port 5432

Services register with Eureka on startup, and the API Gateway routes requests by service name (e.g., `department-service`) instead of hard-coded URLs.

---

## Prerequisites

- Java 21 (for local builds)
- Docker Desktop installed and running

---

## Quick Start


### 1. Build All Backend Services
From the `backend-app` folder:

```powershell
# Only set JAVA_HOME if Java 21 is not your default version:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"

# Build discovery service
cd discovery-service
..\department-service\mvnw.cmd clean package
cd ..

# Build api-gateway
cd api-gateway
..\department-service\mvnw.cmd clean package
cd ..

# Build department service
cd department-service
.\mvnw.cmd clean package
cd ..

# Build municipality service
cd municipality-service
.\mvnw.cmd clean package
cd ..
```

Or use a loop (PowerShell):
```powershell
foreach ($svc in @('discovery-service', 'api-gateway', 'department-service', 'municipality-service')) {
    cd $svc
    if (Test-Path "mvnw.cmd") { .\mvnw.cmd clean package } 
    else { ..\department-service\mvnw.cmd clean package }
    cd ..
}
```

### 2. Start All Services

```powershell
docker-compose up --build
```

To run in the background:
```powershell
docker-compose up -d --build
```

To rebuild after code changes:
```powershell
# Rebuild the affected service(s) as above, then:
docker-compose up --build
```

---

## Service Endpoints & Credentials

Once running, the following are available:

- **Eureka Dashboard**: http://localhost:8761 (view registered services)
- **API Gateway**: http://localhost:8080/api/{service}/... (unified entry point)
- **Department Service** (direct): http://localhost:8081
  - Swagger UI: http://localhost:8081/swagger-ui.html
  - API Docs: http://localhost:8081/v3/api-docs
- **Municipality Service** (direct): http://localhost:8082
  - Swagger UI: http://localhost:8082/swagger-ui.html
  - API Docs: http://localhost:8082/v3/api-docs
- **PostgreSQL Database**: localhost:5432
  - Username: `postgres`
  - Password: `1234`
  - Databases: `department_db`, `municipality_db`

### Using the API Gateway

Call services through the gateway at `http://localhost:8080/api/{service}/...`:

```bash
# Get all departments
curl http://localhost:8080/api/departments/all

# Get department by ID
curl http://localhost:8080/api/departments/{id}

# Get all municipalities
curl http://localhost:8080/api/municipalities/all

# Create a new department (POST)
curl -X POST http://localhost:8080/api/departments/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Fire Brigade",...}'
```

The gateway discovers services via Eureka and routes requests automatically. If a service isn't registered, the gateway falls back to static localhost ports.

---

## Managing Services

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f discovery-service
docker-compose logs -f department-service
```

### Stop Services
```powershell
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```powershell
docker-compose down -v
```

---

## Service Discovery

Services automatically register with Eureka (discovery-service) on startup. The API Gateway resolves service locations dynamically:
- Check registered services at http://localhost:8761
- Gateway routes `/api/departments/...` → `department-service`
- Gateway routes `/api/municipalities/...` → `municipality-service`

Benefits:
- No hard-coded service URLs in the gateway
- Load balancing across multiple instances
- Automatic failover if a service goes down

---

## Troubleshooting

### Java Version Error
If you see `release version 21 not supported`, ensure Java 21 is installed and set JAVA_HOME as shown above.

### Port Already in Use
If ports 8080, 8081, 8082, 8761, or 5432 are already in use:
```powershell
# Find process using port (e.g., 8761)
netstat -ano | findstr :8761

# Kill it (use PID from above)
taskkill /PID <pid> /F

# Or stop all containers
docker-compose down
```

### Database Connection Issues
The services wait for PostgreSQL to be healthy before starting. If you see connection errors, wait a few seconds for the database to initialize.

### Services Not Registering with Eureka
- Check `docker-compose logs discovery-service`
- Verify discovery-service is healthy before other services start
- Ensure `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` points to `http://discovery-service:8761/eureka/`

### Rebuild After Code Changes
```powershell
# Rebuild specific service
cd department-service
.\mvnw.cmd clean package
cd ..
docker-compose up -d --build department-service

# Or rebuild everything
docker-compose down
# ... rebuild all jars ...
docker-compose up --build
```

---

## Note: Docker Desktop

This project uses Docker Compose to run the backend services and the PostgreSQL database in containers. **Docker Desktop must be installed and running** before you use any `docker-compose` commands. Docker Desktop provides the container engine that powers all the backend services, so if it is not running, `docker-compose up` will fail.

You do not need to install PostgreSQL or Java inside the containers—Docker handles that for you. You only need Java 21 installed locally to build the JAR files before starting the containers.
