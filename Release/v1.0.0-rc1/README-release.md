# 🧭 Disaster Response Coordination & Communication System (DRCCS)
### Release v1.0.0-rc1 — November 2025

This document provides instructions for running and verifying **Release v1.0.0-rc1** of the DRCCS system.

---

## ⚙️ Overview

This release includes all major backend microservices and the frontend.  
The system is fully containerized using Docker and orchestrated via `docker-compose-release.yml`.

### ✅ Included
- discovery-service
- api-gateway
- user-service
- incident-service
- resource-service
- notification-service
- department-service
- municipality-service
- region-service
- frontend (React build)

### 🚫 Excluded
- location-service *(planned for v1.1.0)*

---

## 🧰 Requirements

| Tool | Minimum Version | Notes |
|------|------------------|--------|
| Docker Desktop | 26.0+ | Must be running |
| Docker Compose | 2.27+ | Comes with Docker Desktop |
| Internet access | Required | To pull Docker images from Docker Hub |

---

## 🚀 How to Run the Release

### 1️⃣ Pull and Run
```bash
docker compose -f docker-compose-release.yml pull
docker compose -f docker-compose-release.yml up -d
```

---

## 🔍 Verify the Deployment

After running the containers, verify that all services are healthy:

```bash
docker ps
```

All services should show a **"healthy"** or **"up"** status.

You can also open the following URLs to verify manually:

| Service | URL | Description |
|----------|-----|-------------|
| API Gateway | http://localhost:8080 | Main entry point for backend APIs |
| Discovery Service (Eureka) | http://localhost:8761 | Service registry |
| Frontend (React app) | http://localhost:3000 | User interface |

---

## 👤 Default Admin Users (Auto-Generated)

When the system starts, the **User Service** automatically creates default admin accounts depending on the active profile:

### 🔹 In Local/ Release / Docker Environments
| Role | Email | Password | Scope |
|------|--------|-----------|--------|
| **Region Admin** | `region.admin@disaster.nl` | `Admin@123` | Manages all regions |
| **Municipality Admins** | `municipality.deventer@disaster.nl`<br>`municipality.enschede@disaster.nl`<br>`municipality.zwolle@disaster.nl` | `Admin@123` | Manage their respective municipalities |
| **Department Admins** | `dept.fire.deventer@disaster.nl`<br>`dept.police.deventer@disaster.nl`<br>`dept.medical.deventer@disaster.nl`<br>`dept.fire.enschede@disaster.nl`<br>`dept.police.enschede@disaster.nl`<br>`dept.medical.enschede@disaster.nl`<br>`dept.fire.zwolle@disaster.nl`<br>`dept.police.zwolle@disaster.nl`<br>`dept.medical.zwolle@disaster.nl` | `Admin@123` | Manage their local department |

🧩 All admin users have unique auto-generated phone numbers and are linked to their respective region, municipality, or department IDs.

---

## 🧩 Common Commands

| Purpose | Command |
|----------|----------|
| View logs of a specific service | `docker compose -f docker-compose-release.yml logs -f <service-name>` |
| Stop all containers | `docker compose -f docker-compose-release.yml down` |
| Stop and remove all containers, volumes, and networks | `docker compose -f docker-compose-release.yml down -v` |
| Rebuild and rerun everything | `docker compose -f docker-compose-release.yml build --no-cache && docker compose -f docker-compose-release.yml up -d` |

---

## 🧱 Notes

- All images are pulled from the official **DRCCS Docker Hub repository**.
- Environment variables and credentials are preconfigured for this release.
- Default ports are defined in the compose file (8080–8089 for backend services).
- If you encounter network or volume issues, run:
  ```bash
  docker system prune -a
  ```
  before retrying.

---

© 2025 DRCCS Development Team — Release Candidate 1
