# 🧭 DRCCS Deployment Guide

Run the latest stable version of the Disaster Response Coordination & Communication System.

---

## 🚀 Quick Start

**1. Make sure Docker Desktop is running**

**2. Open a terminal in the `release` folder and run:**

```bash
docker-compose pull
docker-compose up -d
```

**3. Access the application:**
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8080

That's it! The system is now running.

---

## 👤 Login Credentials

Use these accounts to access the system:

| Role | Email | Password |
|------|--------|-----------|
| **Region Admin** | `region.admin@disaster.nl` | `Admin@123` |
| **Municipality Admin (Deventer)** | `municipality.deventer@disaster.nl` | `Admin@123` |
| **Department Admin (Fire, Deventer)** | `dept.fire.deventer@disaster.nl` | `Admin@123` |

*Additional municipality and department accounts are available for Enschede and Zwolle.*

---

## 📋 Requirements

- **Docker Desktop** (version 26.0 or higher)
- **4GB available RAM**
- **Internet connection** (to download images)

---

## 🛑 Stopping the System

```bash
docker-compose down
```

To stop and delete all data:
```bash
docker-compose down -v
```

---

## Updating to a Newer Version

```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

---

## ❓ Troubleshooting

**Services won't start?**
- Make sure Docker Desktop is running
- Wait 30-60 seconds for all services to initialize

**Can't access the frontend?**
- Check if port 3000 is available: `netstat -an | findstr :3000`
- View logs: `docker-compose logs frontend`

**Need more help?**
- View all logs: `docker-compose logs`
- Check service status: `docker-compose ps`

---

*For technical details, development setup, or creating releases, see the main project documentation.*
