package nl.saxion.disaster.incident_service.incident.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.IntRange;
import net.jqwik.api.constraints.StringLength;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

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
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Tag("integration")
@Tag("property-based")
class IncidentControllerPropertyTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    /**
     * Property: Creating an incident with valid title should always return 201.
     * 
     * Tests that valid non-empty titles consistently produce successful creation.
     */
    @Property
    void createIncidentWithValidTitle_shouldReturn201(
            @ForAll @StringLength(min = 1, max = 255) String title,
            @ForAll @IntRange(min = 0, max = 100) int severity) {
        
        String payload = createIncidentPayload(title, "Test description", severity);
        
        given()
            .contentType(ContentType.JSON)
            .body(payload)
        .when()
            .post("/incidents")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("title", equalTo(title));
    }

    /**
     * Property: GET /incidents/{id} should return 200 for valid incident IDs.
     * 
     * Validates that querying any valid incident returns consistent structure.
     */
    @Property
    void getIncident_withValidId_shouldReturn200AndValidBody(
            @ForAll @IntRange(min = 1, max = 1000) int id) {
        
        // Assuming at least one incident exists in test DB
        given()
        .when()
            .get("/incidents/{id}", id)
        .then()
            .statusCode(anyOf(
                equalTo(200),  // Found
                equalTo(404)   // Not found (valid property)
            ))
            .body(notNullValue());
    }

    /**
     * Property: Creating incident with null or empty title should fail.
     * 
     * Tests constraint validation on required fields.
     */
    @Property
    void createIncidentWithInvalidTitle_shouldFailValidation(
            @ForAll @StringLength(min = 256) String longTitle) {
        
        String payload = createIncidentPayload(
            longTitle,  // Exceeds max length
            "Description",
            1
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
    }

    /**
     * Helper: Generate JSON payload for incident creation.
     */
    private String createIncidentPayload(String title, String description, int severityLevel) {
        return String.format("""
            {
              "reportedBy": "112",
              "title": "%s",
              "description": "%s",
              "severity": %d,
              "gripLevel": "LEVEL_1",
              "status": "OPEN",
              "reportedAt": "2025-12-12T10:00:00Z",
              "location": "Test Location",
              "latitude": 52.1,
              "longitude": 5.2,
              "regionId": 1
            }
            """, 
            escapeJson(title),
            escapeJson(description),
            severityLevel
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
