FROM openjdk:21-jdk-slim AS build
WORKDIR /app
COPY target/municipality-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]