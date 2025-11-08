# Multi-stage build supporting both local dev (docker-compose) and CI pipelines
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Accept version as build argument
ARG VERSION=1.0.0-SNAPSHOT

# Install Maven (since this service doesn't use Maven wrapper)
RUN apk add --no-cache maven

# Copy and build event-common dependency first
COPY event-common/pom.xml event-common/pom.xml
COPY event-common/src event-common/src
RUN cd event-common && mvn clean install -Drevision=${VERSION} -DskipTests

# Copy project descriptor
COPY notification-service/pom.xml ./

# Download dependencies (cache layer)
RUN mvn dependency:go-offline -Drevision=${VERSION} -DskipTests || true

# Copy source
COPY notification-service/src ./src

# Build the application
RUN mvn clean package -Drevision=${VERSION} -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
