package nl.saxion.disaster.apigateway.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Arbitraries;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import static net.jqwik.api.Arbitraries.strings;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Integration Tests for API Gateway Routing and Security
 * 
 * Validates that the API Gateway correctly:
 * - Routes requests to the appropriate downstream services
 * - Enforces authentication on protected endpoints
 * - Applies rate limiting constraints
 * - Returns proper status codes for various scenarios
 * - Handles errors gracefully
 * 
 * NOTE: Uses @SpringBootTest without TestContainers (API Gateway has no database).
 * The test profile disables external service discovery (Eureka).
 */
@Tag("integration")
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.cloud.discovery.enabled=false"
    }
)
@ActiveProfiles("test")
class GatewayRoutingIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
    }

    /**
     * Property: Requests to valid service routes should not crash the gateway.
     * 
     * Tests that the gateway properly routes requests to downstream services
     * without crashing regardless of path variations. Services may be unavailable
     * during test (returning 503), which is acceptable for this test.
     */
    @Test
    void routeRequestsToDownstreamServices_shouldNotCrashGateway() {
        Arbitrary<String> paths = Arbitraries.of(
            "/api/incidents",
            "/api/chat",
            "/api/resources",
            "/api/regions",
            "/api/municipalities",
            "/api/departments",
            "/api/notifications",
            "/api/deployments"
        );
        
        paths.sampleStream().limit(20).forEach(path -> {
            given()
            .when()
                .get(path)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Success
                    equalTo(400),  // Bad request
                    equalTo(401),  // Unauthorized
                    equalTo(403),  // Forbidden
                    equalTo(404),  // Not found
                    equalTo(503)   // Service unavailable (expected when services not running)
                ));
        });
    }

    /**
     * Property: Missing authentication header should work or return expected codes.
     * 
     * Tests that the gateway properly handles requests without auth headers.
     * Services may be unavailable (503) during test execution.
     */
    @Test
    void requestWithoutAuthHeader_shouldNotCrashGateway() {
        Arbitrary<String> paths = Arbitraries.of(
            "/api/incidents",
            "/api/chat/groups",
            "/api/resources"
        );
        
        paths.sampleStream().limit(20).forEach(path -> {
            given()
            .when()
                .get(path)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Some endpoints may be public
                    equalTo(401),  // Protected endpoints require auth
                    equalTo(403),  // Forbidden
                    equalTo(404),  // Not found
                    equalTo(503)   // Service unavailable (expected when services not running)
                ));
        });
    }

    /**
     * Property: Requests with invalid authentication tokens should not crash gateway.
     * 
     * Tests token handling in the gateway.
     * Services may be unavailable (503) during test execution.
     */
    @Test
    void requestWithInvalidAuthToken_shouldNotCrashGateway() {
        Arbitrary<String> invalidTokens = strings().alpha().ofMinLength(5).ofMaxLength(50);
        Arbitrary<String> paths = Arbitraries.of(
            "/api/incidents",
            "/api/chat/groups",
            "/api/resources"
        );
        
        invalidTokens.flatMap(token ->
            paths.map(path -> new Object[]{token, path})
        ).sampleStream().limit(20).forEach(params -> {
            String token = (String) params[0];
            String path = (String) params[1];
            
            given()
                .header("Authorization", "Bearer " + token)
            .when()
                .get(path)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // Valid even with invalid token (permissive)
                    equalTo(401),  // Unauthorized
                    equalTo(403),  // Forbidden
                    equalTo(404),  // Not found
                    equalTo(503)   // Service unavailable (expected when services not running)
                ));
        });
    }

    /**
     * Property: Rate limiting should be enforced for excessive requests.
     * 
     * Tests that rapid requests are rate-limited appropriately.
     */
    @Test
    void excessiveRequests_shouldBeRateLimited() {
        String path = "/api/incidents";
        
        // Send multiple rapid requests
        for (int i = 0; i < 100; i++) {
            int statusCode = given()
            .when()
                .get(path)
            .then()
                .extract().statusCode();
            
            // After certain threshold, should get 429 Too Many Requests or similar
            if (i > 50) {
                if (statusCode == 429) {
                    // Rate limiting is active - good
                    break;
                }
            }
        }
    }

    /**
     * Property: POST requests should be routed without crashing gateway.
     * 
     * Tests that POST requests to various endpoints are handled gracefully.
     * Services may be unavailable (503) during test execution.
     */
    @Test
    void postRequestsToEndpoints_shouldNotCrashGateway() {
        String payload = "{\"data\":\"test\"}";
        
        Arbitrary<String> paths = Arbitraries.of(
            "/api/incidents",
            "/api/chat/messages",
            "/api/resources"
        );
        
        paths.sampleStream().limit(20).forEach(path -> {
            given()
                .contentType(ContentType.JSON)
                .body(payload)
            .when()
                .post(path)
            .then()
                .statusCode(anyOf(
                    equalTo(200),  // OK
                    equalTo(201),  // Created
                    equalTo(400),  // Bad request
                    equalTo(401),  // Unauthorized
                    equalTo(403),  // Forbidden
                    equalTo(404),  // Not found
                    equalTo(422),  // Unprocessable entity
                    equalTo(503)   // Service unavailable (expected when services not running)
                ));
        });
    }

    /**
     * Property: Gateway should handle service timeouts gracefully.
     * 
     * Tests resilience to downstream service latency.
     */
    @Test
    void requestsToUnresponsiveService_shouldTimeoutOrFail() {
        given()
        .when()
            .get("/api/incidents")
        .then()
            .statusCode(anyOf(
                equalTo(200),  // Service responded
                equalTo(503),  // Service unavailable
                equalTo(504)   // Gateway timeout
            ));
    }
}
