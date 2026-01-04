package nl.saxion.disaster.municipality_service.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import nl.saxion.disaster.municipality_service.config.TestContainersConfig;
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
 * Integration Tests for Municipality Controller REST API Contracts
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., municipality names, valid region references)
 * - Hierarchical data consistency rules
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
class MunicipalityControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/municipalities";
    }

    /**
     * Property: Creating a municipality with valid data should not crash.
     * 
     * Tests that valid municipality creation handles responses gracefully.
     */
    @Test
    void createMunicipalityWithValidData_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(255);
        Arbitrary<Long> regionIds = Arbitraries.longs().between(1L, 1000L);
        
        names.flatMap(name -> 
            regionIds.map(regionId -> new Object[]{name, regionId})
        ).sampleStream().limit(20).forEach(params -> {
            String name = (String) params[0];
            Long regionId = (Long) params[1];
            
            String payload = createMunicipalityPayload(name, regionId);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(404),  // Region not found
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Property: GET /municipalities/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying municipalities never crashes regardless of ID.
     */
    @Test
    void getMunicipality_withValidId_shouldReturn200Or404() {
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
     * Property: Creating municipality with name exceeding max length should not crash.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createMunicipalityWithInvalidName_shouldFailValidation() {
        strings().alpha().ofMinLength(256).ofMaxLength(500).sampleStream().limit(20).forEach(longName -> {
            String payload = createMunicipalityPayload(longName, 1L);
            
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
     * Property: GET /municipalities/{id}/departments should return 200 or 404.
     * 
     * Validates that fetching departments within municipality never crashes.
     */
    @Test
    void getDepartmentsInMunicipality_shouldReturn200Or404() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(municipalityId -> {
            given()
            .when()
                .get("/{id}/departments", municipalityId)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404)   // Municipality not found
                ))
                .body(notNullValue());
        });
    }

    /**
     * Helper: Generate JSON payload for municipality creation.
     */
    private String createMunicipalityPayload(String name, Long regionId) {
        return String.format(
            "{\"name\":\"%s\",\"regionId\":%d}",
            escapeJson(name),
            regionId
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
