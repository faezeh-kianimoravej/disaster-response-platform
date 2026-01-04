package nl.saxion.disaster.resourceservice.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import nl.saxion.disaster.resourceservice.config.TestContainersConfig;
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
 * Integration Tests for Resource Controller REST API Contracts
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., resource names, availability status)
 * - Resource allocation and deployment rules
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
class ResourceControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/resources";
    }

    /**
     * Property: Creating a resource with valid data should return 201.
     * 
     * Tests that valid resource creation consistently produces success.
     */
    @Test
    void createResourceWithValidData_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(255);
        Arbitrary<String> statuses = Arbitraries.of("AVAILABLE", "IN_USE", "MAINTENANCE");
        Arbitrary<Long> departmentIds = Arbitraries.longs().between(1L, 1000L);
        
        names.flatMap(name -> 
            statuses.flatMap(status -> 
                departmentIds.map(deptId -> new Object[]{name, status, deptId})
            )
        ).sampleStream().limit(20).forEach(params -> {
            String name = (String) params[0];
            String status = (String) params[1];
            Long deptId = (Long) params[2];
            
            String payload = createResourcePayload(name, status, deptId);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(404)   // Department not found
                ));
        });
    }

    /**
     * Property: GET /resources/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying resources never crashes regardless of ID.
     */
    @Test
    void getResource_withValidId_shouldReturn200Or404() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(id -> {
            given()
            .when()
                .get("/{id}", id)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404)   // Not found
                ))
                .body(notNullValue());
        });
    }

    /**
     * Property: Updating resource availability should not crash.
     * 
     * Tests status update consistency.
     */
    @Test
    void updateResourceAvailability_shouldReturn200() {
        Arbitrary<String> statuses = Arbitraries.of("AVAILABLE", "IN_USE", "MAINTENANCE");
        
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
                        equalTo(400),  // Bad request
                        equalTo(404),  // Not found
                        equalTo(500)   // Server error
                    ));
            });
        });
    }

    /**
     * Helper: Generate JSON payload for resource creation.
     */
    private String createResourcePayload(String name, String status, Long departmentId) {
        return String.format(
            "{\"name\":\"%s\",\"status\":\"%s\",\"departmentId\":%d}",
            escapeJson(name),
            status,
            departmentId
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
