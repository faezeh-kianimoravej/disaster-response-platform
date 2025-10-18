# API Gateway

Spring Cloud Gateway with Eureka service discovery.

## Ports
- Gateway: 8080
- Discovery: 8761
- Department: 8081
- Municipality: 8082
- Incident: 8083
- Location: 8084

## Routes
- `/api/departments/**` → department-service
- `/api/resources/**` → department-service
- `/api/municipalities/**` → municipality-service
- `/api/incidents/**` → incident-service
- `/api/locations/**` → location-service

## Run
```powershell
mvn spring-boot:run