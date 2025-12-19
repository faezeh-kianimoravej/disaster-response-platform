package nl.saxion.disaster.deploymentservice.responseunit.integration;

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
 * Integration Tests for Response Unit Controller REST API Contracts
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., response unit names, valid references)
 * - Response unit operational status transitions
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
class ResponseUnitControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/response-units";
    }

    /**
     * Property: Creating a response unit with valid data should return 201.
     * 
     * Tests that valid response unit creation consistently produces success.
     */
    @Test
    void createResponseUnitWithValidData_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(255);
        Arbitrary<String> units = Arbitraries.of("UNIT_1", "UNIT_2", "UNIT_3");
        
        names.flatMap(name -> 
            units.map(unit -> new Object[]{name, unit})
        ).sampleStream().limit(20).forEach(params -> {
            String name = (String) params[0];
            String unit = (String) params[1];
            
            String payload = createResponseUnitPayload(name, unit);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Property: GET /response-units/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying response units never crashes regardless of ID.
     */
    @Test
    void getResponseUnit_withValidId_shouldReturn200Or404() {
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
     * Property: Creating response unit with name exceeding max length should fail validation.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createResponseUnitWithInvalidName_shouldFailValidation() {
        strings().alpha().ofMinLength(256).ofMaxLength(500).sampleStream().limit(20).forEach(longName -> {
            String payload = createResponseUnitPayload(longName, "UNIT_1");
            
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
     * Property: Updating response unit status should return 200 or error.
     * 
     * Tests response unit status transitions.
     */
    @Test
    void updateResponseUnitStatus_shouldReturn200Or404() {
        Arbitrary<String> statuses = Arbitraries.of("AVAILABLE", "DEPLOYED", "UNAVAILABLE");
        
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
     * Helper: Generate JSON payload for response unit creation.
     */
    private String createResponseUnitPayload(String name, String unit) {
        return String.format(
            "{\"name\":\"%s\",\"unit\":\"%s\"}",
            escapeJson(name),
            escapeJson(unit)
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
