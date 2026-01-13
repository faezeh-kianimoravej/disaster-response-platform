# Demo Setup Guide - Multi-Device LAN Access

This guide explains how to set up the application for LAN demo on a new laptop/device.

## Prerequisites

1. **Git** - Clone the repository
2. **Docker Desktop** - For running backend services
3. **Node.js** - For frontend development
4. **Maven** - For building Java services
5. **mkcert** - For generating trusted SSL certificates

## Quick Setup Steps

### 1. Install mkcert and Generate Certificates

```powershell
# Install mkcert (Windows - using Chocolatey)
choco install mkcert

# Install local CA
mkcert -install

# Get your hostname and IP
hostname
ipconfig

# Navigate to client-app directory
cd client-app

# Generate certificates (replace with your actual hostname and IP)
mkcert localhost 127.0.0.1 ::1 YOUR-HOSTNAME YOUR-IP-ADDRESS

# This creates files like: YOUR-HOSTNAME+2.pem and YOUR-HOSTNAME+2-key.pem
```

### 2. Update Configuration File

Edit `.env.demo` in the root directory with your values:

```env
DEMO_HOSTNAME=YOUR-HOSTNAME
DEMO_IP_ADDRESS=YOUR-IP-ADDRESS
DEMO_CERT_FILE=YOUR-HOSTNAME+2.pem
DEMO_CERT_KEY_FILE=YOUR-HOSTNAME+2-key.pem
```

### 3. Update Application Files

**Files requiring manual updates (search and replace):**

#### Frontend Files (3 files)

1. **`client-app/src/context/KeycloakProvider.tsx`**

   - Find: `https://PC-Ben:9090/`
   - Replace with: `https://YOUR-HOSTNAME:9090/`

2. **`client-app/.env.production`**

   - Find: `VITE_API_BASE_URL=https://PC-Ben:8080/api`
   - Replace with: `VITE_API_BASE_URL=https://YOUR-HOSTNAME:8080/api`
   - Find: `VITE_WS_URL=wss://PC-Ben:3001`
   - Replace with: `VITE_WS_URL=wss://YOUR-HOSTNAME:3001`

3. **`client-app/vite.config.ts`**
   - Find: `'PC-Ben'` and `'192.168.1.141'` in `preview.allowedHosts`
   - Replace with: `'YOUR-HOSTNAME'` and `'YOUR-IP-ADDRESS'`
   - Find: `fs.readFileSync('PC-Ben+2.pem')`
   - Replace with: `fs.readFileSync('YOUR-HOSTNAME+X.pem')`
   - Find: `fs.readFileSync('PC-Ben+2-key.pem')`
   - Replace with: `fs.readFileSync('YOUR-HOSTNAME+X-key.pem')`

#### Backend Files

1. **`backend-app/docker-compose.yml`**

   - Find: `../client-app/PC-Ben+2.pem` (2 occurrences: keycloak and api-gateway)
   - Replace with: `../client-app/YOUR-HOSTNAME+X.pem`
   - Find: `../client-app/PC-Ben+2-key.pem` (2 occurrences)
   - Replace with: `../client-app/YOUR-HOSTNAME+X-key.pem`

2. **Backend Service Properties Files (4 files):**

   Update `spring.security.oauth2.resourceserver.jwt.allowed-issuers` in:

   - `backend-app/user-service/src/main/resources/application.properties`
   - `backend-app/notification-service/src/main/resources/application.properties`
   - `backend-app/chat-service/src/main/resources/application.properties`
   - `backend-app/region-service/src/main/resources/application.properties`

   Current format:

   ```properties
   spring.security.oauth2.resourceserver.jwt.allowed-issuers=http://localhost:9090/realms/DRCCS,http://192.168.1.141:9090/realms/DRCCS,http://PC-Ben:9090/realms/DRCCS,https://PC-Ben:9090/realms/DRCCS,https://pc-ben:9090/realms/DRCCS
   ```

   Replace with (use YOUR values):

   ```properties
   spring.security.oauth2.resourceserver.jwt.allowed-issuers=http://localhost:9090/realms/DRCCS,http://YOUR-IP:9090/realms/DRCCS,http://YOUR-HOSTNAME:9090/realms/DRCCS,https://YOUR-HOSTNAME:9090/realms/DRCCS,https://your-hostname:9090/realms/DRCCS
   ```

   Note: Include both uppercase and lowercase hostname variants for HTTPS.

### 4. Build and Start Services

```powershell
# Backend - Build all services
cd backend-app
mvn clean package -DskipTests

# Start all containers
docker compose up -d

# Wait for services to start (~2-3 minutes)
docker compose ps

# Frontend - Build
cd ../client-app
npm install
npm run build
```

### 5. Update Keycloak Client Configuration

After containers start, update Keycloak database with redirect URIs:

```powershell
# Connect to Keycloak database
docker exec -it keycloak-db psql -U postgres -d keycloak_db

# Find your client UUID (react-frontend)
SELECT id, client_id FROM client WHERE client_id = 'react-frontend';

# Update redirect URIs (replace YOUR-HOSTNAME and YOUR-IP)
DELETE FROM redirect_uris WHERE client_id = 'YOUR-CLIENT-UUID';

INSERT INTO redirect_uris (client_id, value) VALUES
('YOUR-CLIENT-UUID', 'http://localhost:3000/*'),
('YOUR-CLIENT-UUID', 'http://localhost:4173/*'),
('YOUR-CLIENT-UUID', 'https://localhost:3000/*'),
('YOUR-CLIENT-UUID', 'https://localhost:4173/*'),
('YOUR-CLIENT-UUID', 'http://YOUR-HOSTNAME:3000/*'),
('YOUR-CLIENT-UUID', 'http://YOUR-HOSTNAME:4173/*'),
('YOUR-CLIENT-UUID', 'https://YOUR-HOSTNAME:3000/*'),
('YOUR-CLIENT-UUID', 'https://YOUR-HOSTNAME:4173/*'),
('YOUR-CLIENT-UUID', 'http://YOUR-IP:3000/*'),
('YOUR-CLIENT-UUID', 'http://YOUR-IP:4173/*'),
('YOUR-CLIENT-UUID', 'https://YOUR-IP:3000/*'),
('YOUR-CLIENT-UUID', 'https://YOUR-IP:4173/*');

# Update web origins
DELETE FROM web_origins WHERE client_id = 'YOUR-CLIENT-UUID';

INSERT INTO web_origins (client_id, value) VALUES
('YOUR-CLIENT-UUID', 'http://localhost:3000'),
('YOUR-CLIENT-UUID', 'http://localhost:4173'),
('YOUR-CLIENT-UUID', 'https://localhost:3000'),
('YOUR-CLIENT-UUID', 'https://localhost:4173'),
('YOUR-CLIENT-UUID', 'http://YOUR-HOSTNAME:3000'),
('YOUR-CLIENT-UUID', 'http://YOUR-HOSTNAME:4173'),
('YOUR-CLIENT-UUID', 'https://YOUR-HOSTNAME:3000'),
('YOUR-CLIENT-UUID', 'https://YOUR-HOSTNAME:4173'),
('YOUR-CLIENT-UUID', 'http://YOUR-IP:3000'),
('YOUR-CLIENT-UUID', 'http://YOUR-IP:4173'),
('YOUR-CLIENT-UUID', 'https://YOUR-IP:3000'),
('YOUR-CLIENT-UUID', 'https://YOUR-IP:4173');

# Exit
\q
```

### 6. Configure Windows Firewall

Allow inbound connections for demo:

```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Keycloak HTTPS Demo" -Direction Inbound -Protocol TCP -LocalPort 9090 -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "API Gateway HTTPS Demo" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "Frontend Dev Demo" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "Frontend Preview Demo" -Direction Inbound -Protocol TCP -LocalPort 4173 -Action Allow -Profile Private
```

### 7. Start Frontend

```powershell
cd client-app

# Option 1: Development server
npm run dev

# Option 2: Preview production build
npm run preview
```

### 8. Access from Other Devices

From phones/tablets/laptops on the same network:

1. Navigate to: `https://YOUR-HOSTNAME:3000` or `https://YOUR-HOSTNAME:4173`
2. Accept certificate warning (or install mkcert CA on device)
3. Login with demo credentials
4. Test chat and other features

## Troubleshooting

### 401 Unauthorized Errors

- Check backend service logs: `docker compose logs user-service`
- Verify allowed-issuers includes your hostname (both cases) and IP
- Rebuild services: `mvn clean package -DskipTests` and restart containers

### Keycloak Connection Issues

- Verify Keycloak is running: `docker compose ps keycloak`
- Check logs: `docker compose logs keycloak`
- Ensure port 9090 is accessible: `Test-NetConnection YOUR-HOSTNAME -Port 9090`

### Certificate Issues

- Re-run `mkcert -install` on demo laptop
- Verify cert files exist in `client-app/` directory
- Check docker compose volume mounts match actual filenames

### Can't Access from Other Devices

- Verify Windows Firewall rules are active
- Check devices are on same network: `ipconfig` / `ifconfig`
- Try IP address instead of hostname
- Ensure router doesn't block device-to-device communication

## Quick Reference - Placeholders to Replace

| Placeholder        | Current Value    | Your Value    | Where Used                                             |
| ------------------ | ---------------- | ------------- | ------------------------------------------------------ |
| `PC-Ben`           | Current hostname | YOUR-HOSTNAME | 3 frontend files, docker-compose, 4 backend properties |
| `192.168.1.141`    | Current IP       | YOUR-IP       | vite.config.ts, 4 backend properties                   |
| `PC-Ben+2.pem`     | Current cert     | YOUR-CERT.pem | vite.config.ts, docker-compose.yml (2x)                |
| `PC-Ben+2-key.pem` | Current key      | YOUR-KEY.pem  | vite.config.ts, docker-compose.yml (2x)                |

### Total files to edit: 8 files

- Frontend: 3 files
- Backend: 5 files (1 docker-compose + 4 service properties)

## Demo Credentials

- **Region Admin**: `region.admin@disaster.nl` / `RegionAdmin123!`
- **Municipality Admin**: `municipality.admin@disaster.nl` / `MunicipalityAdmin123!`
- **Keycloak Admin**: `disaster-admin` / `AdminSecure123!`
