# 🚨 Disaster Response — DRCCS

Welcome to the Disaster Response Coordination and Communication System (DRCCS) — a student-built solution for supporting coordination, situational awareness, and communication during large-scale disasters in the Ijsselland region.  
Built with a microservices backend and a modern React front-end, DRCCS empowers first responders, government staff, and affected citizens. 🌍🆘

---

## 🌐 Hosted Frontend
The web portal is live!

**Access via AWS (S3 + CloudFront):**  
[👉 DRCCS Web Portal](https://d2m24xdy5zz2ti.cloudfront.net/)

---

## 🚧 Current Development State
- **Status:** Active development (student project for 2025–2026) 🛠️
- **Backend:** Java (Maven) microservices  
    &nbsp;&nbsp;&nbsp;&nbsp;`api-gateway`, `discovery-service`, `department-service`, `incident-service`, `municipality-service`, `notification-service`, `region-service`
- **Frontend:** React + TypeScript (Vite) in `client-app/`
- **CI/CD:** GitLab CI placeholders (configure pipelines in your GitLab)
- **Known work remaining:**  
    🧪 End‑to‑end tests  
    
---

## ⚡ Quick Start — Local Development
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
mvn clean package -DskipTests
docker-compose down -v; docker-compose build --no-cache; docker-compose up -d
```

Access services:
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080
- See `backend-app/README.md` for all service URLs

### Frontend
```powershell
cd client-app
npm install
npm run dev
```

📖 **Full details:** See `backend-app/README.md` and `client-app/README.md`

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
