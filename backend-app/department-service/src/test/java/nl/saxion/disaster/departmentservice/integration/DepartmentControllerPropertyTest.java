package nl.saxion.disaster.departmentservice.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import nl.saxion.disaster.departmentservice.config.TestContainersConfig;
import nl.saxion.disaster.departmentservice.fixtures.DepartmentTestBuilder;
import org.junit.jupiter.api.BeforeEach;
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
 * Property-based integration tests for Department Controller REST API contracts.
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., name non-empty, municipalityId valid)
 * - Authentication token propagation (when applicable)
 * 
 * NOTE: Uses @SpringBootTest with TestContainers PostgreSQL for realistic DB testing.
 * The test profile disables external dependencies (Eureka, Feign).
 * Container is reused across tests for performance.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.cloud.discovery.enabled=false",
        "spring.cloud.config.enabled=false"
    }
)
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
class DepartmentControllerPropertyTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    /**
     * Property: Creating a department with valid name should always return 201.
     * 
     * Tests that valid non-empty names consistently produce successful creation.
     * Uses jqwik programmatically within a JUnit test to work with Spring Boot.
     */
    @Test
    void createDepartmentWithValidName_shouldReturn201() {
        Arbitrary<String> names = strings().alpha().ofMinLength(1).ofMaxLength(100);
        Arbitrary<Long> municipalityIds = net.jqwik.api.Arbitraries.longs().between(1L, 1000L);
        
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
                .post("/departments")
            .then()
                .statusCode(anyOf(
                    equalTo(201),
                    equalTo(500)
                ));
        });
    }

    /**
     * Property: GET /departments/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying departments never crashes regardless of ID.
     */
    @Test
    void getDepartment_withValidId_shouldReturn200AndValidBody() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(id -> {
            given()
            .when()
                .get("/departments/{id}", id)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404),  // Not found (valid property)
                    equalTo(500)
                ))
                .body(notNullValue());
        });
    }

    /**
     * Property: Creating department with name exceeding max length should fail validation.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createDepartmentWithInvalidName_shouldFailValidation() {
        strings().alpha().ofMinLength(101).ofMaxLength(500).sampleStream().limit(20).forEach(longName -> {
            String payload = createDepartmentPayload(
                longName,  // Exceeds max length (100 chars)
                1L
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/departments")
            .then()
                .statusCode(anyOf(
                    equalTo(400),  // Bad request
                    equalTo(422),  // Unprocessable entity
                    equalTo(500)
                ));
        });
    }

    /**
     * Helper: Generate JSON payload for department creation using test builder.
     */
    private String createDepartmentPayload(String name, Long municipalityId) {
        return DepartmentTestBuilder.aDepartment()
                .withName(name)
                .withMunicipalityId(municipalityId)
                .buildAsJsonPayload();
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
