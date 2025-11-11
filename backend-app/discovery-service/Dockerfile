# Multi-stage build supporting both local dev (docker-compose) and CI pipelines
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Accept version as build argument
ARG VERSION=1.0.0-dev

# Copy Maven wrapper files
COPY .mvn .mvn
COPY mvnw ./
COPY mvnw.cmd ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Copy project descriptor
COPY pom.xml ./

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -Drevision=${VERSION} -DskipTests || true

# Copy source
COPY src ./src

# Build the application
RUN ./mvnw clean package -Drevision=${VERSION} -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8761

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8761/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
