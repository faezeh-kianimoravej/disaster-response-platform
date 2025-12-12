package nl.saxion.disaster.chat_service.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * TestContainers configuration for integration tests.
 * 
 * Provides a shared PostgreSQL container instance that can be reused across
 * all integration tests in the chat-service module.
 * 
 * The @ServiceConnection annotation automatically configures Spring Boot's
 * DataSource properties to connect to the containerized database.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestContainersConfig {

    /**
     * Creates a PostgreSQL container that will be shared across tests.
     * 
     * Using postgres:15-alpine for faster startup and smaller image size.
     * The container is started once and reused for all tests in the class.
     */
    @Bean
    @ServiceConnection
    public PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>(DockerImageName.parse("postgres:15-alpine"))
                .withDatabaseName("chat_test_db")
                .withUsername("test")
                .withPassword("test")
                .withReuse(true); // Reuse container across test runs for speed
    }
}
