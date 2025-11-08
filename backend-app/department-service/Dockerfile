# Multi-stage build supporting both local dev (docker-compose) and CI pipelines
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Install Maven (since this service doesn't use Maven wrapper)
RUN apk add --no-cache maven

# Copy project descriptor
COPY pom.xml ./

# Download dependencies (cache layer)
RUN mvn dependency:go-offline -DskipTests || true

# Copy source
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
