# Multi-stage build supporting both local dev (docker-compose) and CI pipelines
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Accept version as build argument
ARG VERSION=1.0.0-dev

# Copy Maven wrapper files for event-common
COPY event-common/.mvn event-common/.mvn
COPY event-common/mvnw event-common/mvnw
COPY event-common/mvnw.cmd event-common/mvnw.cmd

# Copy Maven wrapper files for incident-service
COPY incident-service/.mvn .mvn
COPY incident-service/mvnw ./mvnw
COPY incident-service/mvnw.cmd ./mvnw.cmd

# Make Maven wrappers executable
RUN chmod +x event-common/mvnw && chmod +x mvnw

# Copy and build event-common dependency first
COPY event-common/pom.xml event-common/pom.xml
COPY event-common/src event-common/src
RUN cd event-common && ./mvnw clean install -Drevision=${VERSION} -DskipTests

# Copy project descriptor
COPY incident-service/pom.xml ./

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -Drevision=${VERSION} -DskipTests || true

# Copy source
COPY incident-service/src ./src

# Build the application
RUN ./mvnw clean package -Drevision=${VERSION} -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8084/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
