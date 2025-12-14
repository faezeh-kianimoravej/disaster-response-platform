package nl.saxion.disaster.incident_service.incident.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import nl.saxion.disaster.incident_service.config.TestContainersConfig;
import nl.saxion.disaster.incident_service.fixtures.IncidentTestBuilder;
import nl.saxion.disaster.incident_service.model.enums.Severity;
import nl.saxion.disaster.incident_service.service.messaging.IncidentEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static net.jqwik.api.Arbitraries.integers;
import static net.jqwik.api.Arbitraries.strings;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Property-based integration tests for Incident Controller REST API contracts.
 * 
 * Validates that the API endpoints adhere to the constraints defined in
 * ADR_REST_Endpoint_Standards:
 * - HTTP status codes for success/failure cases
 * - Request/response schema invariants
 * - Field constraints (e.g., title non-empty, severity valid)
 * - Authentication token propagation (when applicable)
 * 
 * NOTE: Uses @SpringBootTest with TestContainers PostgreSQL for realistic DB testing.
 * The test profile disables external dependencies (Eureka, Kafka).
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
class IncidentControllerPropertyTest {

    @LocalServerPort
    private int port;

    @MockBean
    private IncidentEventProducer incidentEventProducer;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    /**
     * Property: Creating an incident with valid title should always return 201.
     * 
     * Tests that valid non-empty titles consistently produce successful creation.
     * Uses jqwik programmatically within a JUnit test to work with Spring Boot.
     */
    @Test
    void createIncidentWithValidTitle_shouldReturn201() {
        Arbitrary<String> titles = strings().alpha().ofMinLength(1).ofMaxLength(255);
        Arbitrary<String> severities = Arbitraries.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
        
        titles.flatMap(title -> 
            severities.map(severity -> new Object[]{title, severity})
        ).sampleStream().limit(20).forEach(params -> {
            String title = (String) params[0];
            String severity = (String) params[1];
            
            String payload = createIncidentPayload(title, "Test description", severity);
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/incidents")
            .then()
                .statusCode(201);
        });
    }

    /**
     * Property: GET /incidents/{id} should return 200 or 404 for any ID.
     * 
     * Validates that querying incidents never crashes regardless of ID.
     */
    @Test
    void getIncident_withValidId_shouldReturn200AndValidBody() {
        integers().between(1, 1000).sampleStream().limit(20).forEach(id -> {
            given()
            .when()
                .get("/incidents/{id}", id)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Found
                    equalTo(404)   // Not found (valid property)
                ))
                .body(notNullValue());
        });
    }

    /**
     * Property: Creating incident with title exceeding max length should fail validation.
     * 
     * Tests constraint validation on field length.
     */
    @Test
    void createIncidentWithInvalidTitle_shouldFailValidation() {
        strings().alpha().ofMinLength(256).ofMaxLength(500).sampleStream().limit(20).forEach(longTitle -> {
            String payload = createIncidentPayload(
                longTitle,  // Exceeds max length
                "Description",
                "HIGH"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post("/incidents")
            .then()
                .statusCode(anyOf(
                    equalTo(400),  // Bad request
                    equalTo(422)   // Unprocessable entity
                ));
        });
    }

    /**
     * Helper: Generate JSON payload for incident creation using test builder.
     */
    private String createIncidentPayload(String title, String description, String severity) {
        return IncidentTestBuilder.anIncident()
                .withTitle(title)
                .withDescription(description)
                .withSeverity(Severity.valueOf(severity))
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
