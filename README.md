# 🚨 Disaster Response — DRCCS

Welcome to the Disaster Response Coordination and Communication System (DRCCS) — a student-built solution for supporting coordination, situational awareness, and communication during large-scale disasters in the Ijsselland region.  
Built with a microservices backend and a modern React front-end, DRCCS empowers first responders, government staff, and affected citizens. 🌍🆘

---

## Who this README is for

- **Users/operators:** see "User Deployment Guide" below to run a release from Docker Hub.
- **Developers:** see "Developer Guide" for local development, testing, and releasing.

---

## 🚧 Project Status

- **Status:** Proof of Concept release (student project for 2025–2026) 🛠️
- **Backend:** Java (Maven) microservices  
   `api-gateway`, `discovery-service`, `department-service`, `incident-service`, `municipality-service`, `notification-service`, `region-service`, `deployment-service`, `user-service`
- **Frontend:** React + TypeScript (Vite) in `client-app/`

[![Pipeline status](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/badges/main/pipeline.svg)](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/pipelines)  
Latest stable release: [Releases page](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/releases)  

### Frontend tests

[![Frontend coverage](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/jobs/artifacts/main/raw/client-app/badges/coverage.svg?job=test:frontend)](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/pipelines)

[![Frontend tests](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/jobs/artifacts/main/raw/client-app/badges/tests.svg?job=test:frontend)](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/pipelines)

### Backend tests

[![Backend coverage](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/jobs/artifacts/main/raw/backend-app/badges/coverage.svg?job=test:backend-app)](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/pipelines)

[![Backend tests](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/jobs/artifacts/main/raw/backend-app/badges/tests.svg?job=test:backend-app)](https://gitlab.com/saxionnl/master-ict-se/software-engineering-project/2025-2026/06/-/pipelines)
---

## 📦 User Deployment Guide — Run a Release

Run DRCCS using pre-built images from Docker Hub.

1. Install Docker Desktop and Docker Compose
2. From the `release/` directory:

```powershell
cd release
docker-compose pull
docker-compose up -d
```

Services:

- Frontend: <http://localhost:3000>
- API Gateway: <http://localhost:8080>
- Eureka: <http://localhost:8761>

**📖 Full deployment documentation:** See [`release/README.md`](release/README.md)

---

## 🧑‍💻 Developer Guide — Local Development

### Prerequisites

- ☕ **Java 21** (for backend builds)
- 🧰 **Apache Maven 3.8+** (for building the backend services)
- 🐳 **Docker Desktop** (must be running)
- 🟩 **Node.js 16+** (for frontend)

### Backend (with Docker)

**Normal start:**

```powershell
cd backend-app
docker-compose up -d
```

**Fresh rebuild** (first time / after changes):

```powershell
cd backend-app
docker-compose down -v
mvn clean package -DskipTests
docker-compose build --no-cache; docker-compose up -d
```

Access services:

- **Eureka Dashboard**: <http://localhost:8761>
- **API Gateway**: <http://localhost:8080>
- See `backend-app/README.md` for all service URLs

### Frontend

```powershell
cd client-app
npm install
npm run dev
```

📖 **Full details:** See `backend-app/README.md` and `client-app/README.md`

---

## 🚀 Developer Release Process (Tag-Based)

Releases are created via GitLab CI/CD when you push a version tag.

1. Update the `VERSION` file
2. Commit to `main`
3. Create and push tag: `git tag -a v1.0.0 -m "Release v1.0.0" && git push origin v1.0.0`
4. CI builds & publishes all Docker images and creates a GitLab Release

Details: see [`RELEASING.md`](RELEASING.md)

Images: `fkiani/disaster-response-*` on Docker Hub

---

## 🏗️ Architecture Overview

- Microservices: incidents, locations, resources, notifications, discovery
- React + TypeScript frontend (Vite)
- REST APIs between services; notifications via push/messaging
- Each service owns its data and deployment lifecycle

---

## 👥 Team

- Sepideh
- Faezeh
- Furqan
- Ben (Project Coordinator / Scrum Master) 🧑‍💼

See [`Docs/Team-Charter.md`](Docs/Team-Charter.md) for process, meetings, and roles.

---

## 🤝 Contributing

- Use feature branches & merge requests
- Include tests and update API docs for any public endpoints
- Follow security and code-quality checks before merging

---

## 🔐 Security Scanning

This repo uses a Free‑tier friendly security setup in GitLab CI:

- SAST: included via GitLab’s Security/SAST template. On Free, results appear in job logs/artifacts rather than the full Security dashboard.
- Secret Detection: included via Security/Secret‑Detection template to catch leaked credentials/tokens.
- Semgrep OSS: additional SAST job that outputs a SARIF report artifact and summarises findings in logs.

Notes:

- Scans exclude heavy build folders (node_modules, dist/build, coverage, target) to keep jobs fast.
- Jobs are non‑blocking by default. We can enforce fail‑on‑severity (e.g., High/Critical) once noise is acceptable.

## 📬 Contact / Support

- Open an issue in this repository
- Or contact the project coordinator (see [`Docs/Team-Charter.md`](Docs/Team-Charter.md))

---
