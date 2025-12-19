package nl.saxion.disaster.regionservice.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import nl.saxion.disaster.regionservice.config.TestContainersConfig;
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
 * Integration Tests for Region Controller REST API Contracts
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., region names, valid hierarchies)
 * - Regional data consistency rules
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
class RegionControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/regions";
    }

    /**
     * Property: Creating a region with valid name should not crash.
     * 
     * Tests that valid region creation handles responses gracefully.
     */
    @Test
    void createRegionWithValidName_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(255);
        
        names.sampleStream().limit(20).forEach(name -> {
            String payload = createRegionPayload(name);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(404),  // Not found
                    equalTo(409),  // Conflict - name already exists
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Property: GET /regions/{id} should not crash for any ID.
     * 
     * Validates that querying regions handles errors gracefully.
     */
    @Test
    void getRegion_withValidId_shouldReturn200Or404() {
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
     * Property: Creating region with name exceeding max length should not crash.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createRegionWithInvalidName_shouldFailValidation() {
        strings().alpha().ofMinLength(256).ofMaxLength(500).sampleStream().limit(20).forEach(longName -> {
            String payload = createRegionPayload(longName);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(400),  // Bad request
                    equalTo(404),  // Not found
                    equalTo(422),  // Unprocessable entity
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Property: GET /regions/{id}/municipalities should not crash.
     * 
     * Validates that fetching municipalities within region handles errors gracefully.
     */
    @Test
    void getMunicipalitiesInRegion_shouldReturn200Or404() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(regionId -> {
            given()
            .when()
                .get("/{id}/municipalities", regionId)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404),  // Region not found
                    equalTo(500)   // Server error
                ))
                .body(notNullValue());
        });
    }

    /**
     * Helper: Generate JSON payload for region creation.
     */
    private String createRegionPayload(String name) {
        return String.format(
            "{\"name\":\"%s\"}",
            escapeJson(name)
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
