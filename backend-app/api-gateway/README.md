# API Gateway

Spring Cloud Gateway with Eureka service discovery.

## Ports

- Gateway: 8080
- Discovery: 8761
- Department: 8081
- Municipality: 8082
- Incident: 8083

## Routes

- `/api/departments/**` → department-service
- `/api/resources/**` → department-service
- `/api/municipalities/**` → municipality-service
- `/api/incidents/**` → incident-service

## Run

```powershell
mvn spring-boot:run
```
