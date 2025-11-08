# Multi-stage build supporting both local dev (docker-compose) and CI pipelines
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Accept version as build argument
ARG VERSION=1.0.0-SNAPSHOT

# Install Maven (since this service doesn't use Maven wrapper)
RUN apk add --no-cache maven

# Copy project descriptor
COPY pom.xml ./

# Download dependencies (cache layer)
RUN mvn dependency:go-offline -Drevision=${VERSION} -DskipTests || true

# Copy source
COPY src ./src

# Build the application
RUN mvn clean package -Drevision=${VERSION} -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
