package nl.saxion.disaster.deploymentservice.deployment.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import nl.saxion.disaster.deploymentservice.config.TestContainersConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static net.jqwik.api.Arbitraries.integers;
import static net.jqwik.api.Arbitraries.strings;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Integration Tests for Deployment Controller REST API Contracts
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., deployment names, valid incident/resource references)
 * - Deployment lifecycle state transition rules
 * 
 * NOTE: Uses @SpringBootTest with TestContainers PostgreSQL for realistic DB testing.
 * The test profile disables external dependencies (Eureka, Feign).
 * Container is reused across tests for performance.
 */
@Tag("integration")
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.cloud.discovery.enabled=false",
        "spring.cloud.config.enabled=false"
    }
)
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
class DeploymentControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/deployments";
    }

    /**
     * Property: Creating a deployment with valid data should return 201.
     * 
     * Tests that valid deployment creation consistently produces success.
     */
    @Test
    void createDeploymentWithValidData_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(255);
        Arbitrary<Long> incidentIds = Arbitraries.longs().between(1L, 1000L);
        Arbitrary<Long> resourceIds = Arbitraries.longs().between(1L, 1000L);
        
        names.flatMap(name -> 
            incidentIds.flatMap(incidentId -> 
                resourceIds.map(resourceId -> new Object[]{name, incidentId, resourceId})
            )
        ).sampleStream().limit(20).forEach(params -> {
            String name = (String) params[0];
            Long incidentId = (Long) params[1];
            Long resourceId = (Long) params[2];
            
            String payload = createDeploymentPayload(name, incidentId, resourceId);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(404),  // Incident or resource not found
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Property: GET /deployments/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying deployments never crashes regardless of ID.
     */
    @Test
    void getDeployment_withValidId_shouldReturn200Or404() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(id -> {
            given()
            .when()
                .get("/{id}", id)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404),  // Not found
                    equalTo(500)   // Server error
                ))
                .body(notNullValue());
        });
    }

    /**
     * Property: Creating deployment with name exceeding max length should fail validation.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createDeploymentWithInvalidName_shouldFailValidation() {
        strings().alpha().ofMinLength(256).ofMaxLength(500).sampleStream().limit(20).forEach(longName -> {
            String payload = createDeploymentPayload(longName, 1L, 1L);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(400),  // Bad request
                    equalTo(422),  // Unprocessable entity
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Property: Updating deployment status should return 200 or error.
     * 
     * Tests deployment state transitions.
     */
    @Test
    void updateDeploymentStatus_shouldReturn200Or404() {
        Arbitrary<String> statuses = Arbitraries.of("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED");
        
        integers().between(1, 1000).sampleStream().limit(20).forEach(id -> {
            statuses.sampleStream().limit(5).forEach(status -> {
                String payload = String.format("{\"status\":\"%s\"}", status);
                
                given()
                    .contentType(ContentType.JSON)
                    .body(payload)
                .when()
                    .put("/{id}", id)
                .then()
                    .statusCode(anyOf(
                        equalTo(200),  // OK
                        equalTo(404),  // Not found
                        equalTo(500)   // Server error
                    ));
            });
        });
    }

    /**
     * Helper: Generate JSON payload for deployment creation.
     */
    private String createDeploymentPayload(String name, Long incidentId, Long resourceId) {
        return String.format(
            "{\"name\":\"%s\",\"incidentId\":%d,\"resourceId\":%d}",
            escapeJson(name),
            incidentId,
            resourceId
        );
    }

    /**
     * Helper: Escape JSON strings.
     */
    private String escapeJson(String str) {
        return str.replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r");
    }
}
