
# Backend Services

This folder contains all backend microservices and the Docker Compose setup for local development.

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
.\department-service\mvnw.cmd -f pom.xml clean package
```

This builds all services (department, municipality, incident, location) and runs their tests. JAR files are created in each service's `target/` folder.

### 2. Start All Services

```powershell
docker-compose up
```

To run in the background:
```powershell
docker-compose up -d
```

To rebuild after code changes:
```powershell
# Rebuild the affected service(s) as above, then:
docker-compose up --build
```

---

## Service Endpoints & Credentials

Once running, the following are available:

- **Department Service**: http://localhost:8081
  - Swagger UI: http://localhost:8081/swagger-ui.html
  - API Docs: http://localhost:8081/v3/api-docs
- **Municipality Service**: http://localhost:8082
  - Swagger UI: http://localhost:8082/swagger-ui.html
  - API Docs: http://localhost:8082/v3/api-docs
- **PostgreSQL Database**: localhost:5432
  - Username: `postgres`
  - Password: `1234`
  - Databases: `department_db`, `municipality_db`

---

## Managing Services

### View Logs
```powershell
# All services
docker-compose logs -f
# Specific service
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

## Troubleshooting

### Java Version Error
If you see `release version 21 not supported`, ensure Java 21 is installed and set JAVA_HOME as shown above.

### Port Already in Use
If ports 8081, 8082, or 5432 are already in use:
```powershell
docker-compose down
# Stop the conflicting application
docker-compose up
```

### Database Connection Issues
The services wait for PostgreSQL to be healthy before starting. If you see connection errors, wait a few seconds for the database to initialize.

---

## Note: Docker Desktop

This project uses Docker Compose to run the backend services and the PostgreSQL database in containers. **Docker Desktop must be installed and running** before you use any `docker-compose` commands. Docker Desktop provides the container engine that powers all the backend services, so if it is not running, `docker-compose up` will fail.

You do not need to install PostgreSQL or Java inside the containers—Docker handles that for you. You only need Java 21 installed locally to build the JAR files before starting the containers.
