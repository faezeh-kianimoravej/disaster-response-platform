API Gateway
===========

This lightweight API Gateway forwards requests from a unified /api/{service}/... path to the local backend services.

Default routes (static mapping in code):

- /api/departments -> department-service (http://localhost:8081)
- /api/incidents -> incident-service (http://localhost:8081)
- /api/municipalities -> municipality-service (http://localhost:8082)
- /api/locations -> location-service (http://localhost:8082)

Run locally:

1. Make sure backend services are running on their configured ports (see `application.properties` in each service).
2. Start the gateway on port 8080.

Option A — use an existing wrapper (no system Maven needed):

```powershell
cd ..\department-service
.\u005cmvnw.cmd -f ..\api-gateway\pom.xml spring-boot:run
```

Option B — if you copy the wrapper into this folder:

```powershell
.\u005cmvnw.cmd spring-boot:run
```

Option C — if you have Maven installed:

```powershell
mvn spring-boot:run
```

Notes & next steps:

- This gateway forwards method, path, query, headers and body using `WebClient`.
- CORS is enabled for `/api/**` to help during local development.
- Later add request validation/authentication via a Spring `OncePerRequestFilter` or reactive `WebFilter`.
- For more advanced features, consider migrating to Spring Cloud Gateway.
