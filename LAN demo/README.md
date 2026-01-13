# LAN Demo Setup

This folder contains configuration and setup documentation for running the disaster management application across multiple devices on a local area network (LAN).

## ⚠️ Important Requirements

### Git Branch

**This demo only works on the `demo` branch.** Ensure you have checked out the correct branch before proceeding:

```powershell
git branch
git checkout demo
```

### Setup is Required

**You must complete the full setup process** outlined in `DEMO_SETUP_GUIDE.md` before deploying this demo. This is not a plug-and-play solution—configuration specific to your hardware is required.

## What You Need

- [.env.demo](../.env.demo) - Configuration template with placeholders
- [DEMO_SETUP_GUIDE.md](./DEMO_SETUP_GUIDE.md) - Complete step-by-step setup instructions

## Quick Start

1. **Read** `DEMO_SETUP_GUIDE.md` completely
2. **Update** `.env.demo` with your hardware details (hostname, IP, certificate filenames)
3. **Follow** the setup steps to update 8 configuration files across frontend and backend
4. **Configure** Windows Firewall and Keycloak database
5. **Build** and **start** the application

## Why Setup is Needed

Each device on your LAN has unique properties:

- **Hostname** - Used for SSL certificates and service discovery
- **IP Address** - Required for cross-device communication
- **SSL Certificates** - Generated per-device with mkcert
- **Keycloak Configuration** - Database must know your device's redirect URIs

The demo branch contains the base configuration; your local setup makes it work on your specific network.

## First Time? Start Here

→ Open `DEMO_SETUP_GUIDE.md` and follow the "Quick Setup Steps" section

## Still Have Questions?

Check the Troubleshooting section in `DEMO_SETUP_GUIDE.md` for solutions to common issues.

---

**Setup Time:** ~30-45 minutes (first time only)  
**Demo Credentials:** See DEMO_SETUP_GUIDE.md
