# Multi-stage build supporting both local dev (docker-compose) and CI pipelines
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Copy Maven wrapper if present
COPY mvnw* ./
COPY .mvn .mvn

# Copy project descriptor
COPY pom.xml ./

# Download dependencies (cache layer)
RUN if [ -f ./mvnw ]; then \
      ./mvnw dependency:go-offline -DskipTests || true; \
    else \
      mvn dependency:go-offline -DskipTests || true; \
    fi

# Copy source
COPY src ./src

# Build the application
RUN if [ -f ./mvnw ]; then \
      ./mvnw clean package -DskipTests; \
    else \
      mvn clean package -DskipTests; \
    fi

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
