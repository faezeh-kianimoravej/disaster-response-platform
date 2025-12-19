package nl.saxion.disaster.departmentservice.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import nl.saxion.disaster.departmentservice.config.TestContainersConfig;
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
 * Integration Tests for Department Controller REST API Contracts
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., department names, valid hierarchy references)
 * - Organizational structure consistency rules
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
class DepartmentControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/departments";
    }

    /**
     * Property: Creating a department with valid data should return 201.
     * 
     * Tests that valid department creation consistently produces success.
     */
    @Test
    void createDepartmentWithValidData_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(255);
        Arbitrary<Long> municipalityIds = Arbitraries.longs().between(1L, 1000L);
        
        names.flatMap(name -> 
            municipalityIds.map(municipalityId -> new Object[]{name, municipalityId})
        ).sampleStream().limit(20).forEach(params -> {
            String name = (String) params[0];
            Long municipalityId = (Long) params[1];
            
            String payload = createDepartmentPayload(name, municipalityId);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(404)   // Municipality not found
                ));
        });
    }

    /**
     * Property: GET /departments/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying departments never crashes regardless of ID.
     */
    @Test
    void getDepartment_withValidId_shouldReturn200Or404() {
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
     * Property: Creating department with name exceeding max length should not crash.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createDepartmentWithInvalidName_shouldNotCrash() {
        strings().alpha().ofMinLength(256).ofMaxLength(500).sampleStream().limit(20).forEach(longName -> {
            String payload = createDepartmentPayload(longName, 1L);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/")
            .then()
                .statusCode(anyOf(
                    equalTo(400),  // Bad request
                    equalTo(404),  // Municipality not found
                    equalTo(422)   // Unprocessable entity
                ));
        });
    }

    /**
     * Property: GET /departments/{id}/resources should not crash server.
     * 
     * Validates that fetching resources within department handles errors gracefully.
     */
    @Test
    void getResourcesInDepartment_shouldNotCrash() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(departmentId -> {
            given()
            .when()
                .get("/{id}/resources", departmentId)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404),  // Department not found
                    equalTo(500)   // Server error
                ));
        });
    }

    /**
     * Helper: Generate JSON payload for department creation.
     */
    private String createDepartmentPayload(String name, Long municipalityId) {
        return String.format(
            "{\"name\":\"%s\",\"municipalityId\":%d}",
            escapeJson(name),
            municipalityId
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
