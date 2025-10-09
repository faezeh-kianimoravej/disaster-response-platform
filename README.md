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
- **Status:** Active development (student project for 2024–2025) 🛠️
- **Backend:** Java (Maven) microservices  
    &nbsp;&nbsp;&nbsp;&nbsp;`incident-service`, `location-service`, `resource-service`, `notification-service`, `discovery-service`
- **Frontend:** React + TypeScript (Vite) in `client-app/`
- **CI/CD:** GitLab CI placeholders (configure pipelines in your GitLab)
- **Known work remaining:**  
    🔗 Integration between services  
    🧪 End‑to‑end tests  
    🚀 Production deployment scripts  
    📄 Full API documentation

---

## ⚡ Quick Start — Local Development

**Prerequisites:**  
☕ Java 11+ & Maven (backend)  
🟩 Node.js 16+ & npm/yarn (frontend)  
🐳 Docker (optional)

**Backend:**  
- Build (service folder):  
    - Windows: `mvnw.cmd clean package`  
    - Unix: `./mvnw clean package`
- Run:  
    `java -jar target/<artifact>.jar`

**Frontend:**  
- In `client-app/`:  
    `npm install`  
    `npm run dev`

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

## 📬 Contact / Support
- Open an issue in this repository  
- Or contact the project coordinator (see [`Docs/Team-Charter.md`](Docs/Team-Charter.md))

---
