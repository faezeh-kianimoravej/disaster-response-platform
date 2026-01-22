# ADR: Integration Testing Strategy with Property-Based Framework

**Status:** Accepted  
**Date:** 2025-11-10 (Updated: 2025-12-12)  
**Sprint:** 12  
**Related ADRs:** ADR_REST_Endpoint_Standards

## Context

The Disaster Response system consists of multiple Spring Boot microservices exposing REST APIs. These APIs form the primary contract between services and frontend clients, making their correctness critical.

**Key Requirements:**

- Automated integration testing to meet quality rubrics (80-100% for Rubric 1, 55-100% for Rubric 2)
- Traditional unit tests alone are insufficient; need framework to discover edge cases
- Testing must balance coverage, speed, and maintainability
- Framework must integrate seamlessly with Spring Boot Test

## Decision

Implement **property-based integration testing** using:

1. **jqwik 1.8.5** as the primary framework
2. **RestAssured 5.4.0** for HTTP contract testing DSL
3. **TestContainers 1.19.7** for isolated database testing (PostgreSQL)

## Test Approach

Controller integration tests are **integration tests at the web layer**, verifying:

- Spring MVC request handling and routing
- Validation and serialization
- HTTP status codes and response bodies
- Authentication/authorization (where applicable)
- **Constraints and invariants** (via property-based testing)

The service layer is typically mocked; no real database or external systems involved (for fast tests).

### Two Complementary Approaches

#### Property-Based Integration Tests (Primary - Recommended)

- `@SpringBootTest(webEnvironment = RANDOM_PORT)` with full context
- `RestAssured` for HTTP DSL
- **jqwik** `@Property` with `@ForAll` generators
- **TestContainers** for real database (PostgreSQL)
- Validates invariants across 1000s of generated inputs
- **Comprehensive**: Discovers edge cases automatically
- **Efficient**: One property replaces 50+ hardcoded test cases

#### Traditional Integration Tests (Secondary - Optional)

- `@SpringBootTest` with full application context
- `MockMvc` to simulate HTTP requests
- `@MockBean` to replace service dependencies
- JSON assertions to validate API contracts
- **Fast**: 100-200ms per test
- **Simple to understand**: Hardcoded scenarios
- **Use for**: Documentation of specific workflows, simple edge cases

## Rationale

### Why Property-Based Testing?

Property-based testing generates hundreds/thousands of test inputs to validate invariants, discovering edge cases that hardcoded tests miss. Much more efficient than writing 50 test cases manually.

### Why jqwik?

| Aspect                 | jqwik                                 | junit-quickcheck             |
| ---------------------- | ------------------------------------- | ---------------------------- |
| **Maintenance**        | Actively maintained (1.8.5)           | Maintained but less frequent |
| **IDE Support**        | Full IntelliJ/Eclipse integration     | Good but less native         |
| **Spring Integration** | Seamless with Spring Boot Test        | Requires more setup          |
| **Documentation**      | Comprehensive, active community       | Good but smaller community   |
| **Shrinking**          | Excellent (produces minimal failures) | Good                         |
| **License**            | EPL 1.0                               | Apache 2.0                   |

jqwik chosen because it's actively maintained, has excellent IDE support, and integrates seamlessly with existing Spring Boot Test infrastructure.

## Implementation Details

### Dependencies

Added to all service `pom.xml` files (template from `incident-service`):

```xml
<!-- Property-Based Testing with jqwik -->
<dependency>
    <groupId>net.jqwik</groupId>
    <artifactId>jqwik</artifactId>
    <version>1.8.5</version>
    <scope>test</scope>
</dependency>

<!-- HTTP API Testing -->
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <version>5.4.0</version>
    <scope>test</scope>
</dependency>

<!-- Database Containers -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <version>1.19.7</version>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.19.7</version>
    <scope>test</scope>
</dependency>
```

### Test Organization

```text
src/test/java/nl/saxion/disaster/{service}/
├── unit/
│   └── *Test.java (service/model logic)
├── integration/
│   ├── *PropertyTest.java (property-based, uses @ForAll generators)
│   └── *IntegrationTest.java (traditional, specific scenarios - optional)
└── e2e/
    └── *E2ETest.java (full microservice flow - rare)
```

### Property-Based Test Pattern (Recommended)

```java
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
     * Property: Creating incident with valid title always returns 201
     */
    @Property
    void createWithValidTitle_returns201(
        @ForAll @StringLength(min = 1, max = 255) String title,
        @ForAll @IntRange(min = 0, max = 100) int severity) {

        String payload = createPayload(title, severity);

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
     * Property: Invalid titles are rejected with 400
     */
    @Property
    void createWithEmptyTitle_returns400(
        @ForAll @StringLength(min = 256, max = 500) String tooLongTitle) {

        String payload = createPayload(tooLongTitle, 50);

        given()
            .contentType(ContentType.JSON)
            .body(payload)
        .when()
            .post("/incidents")
        .then()
            .statusCode(400)
            .body("errors", notNullValue());
    }
}
```

Validates property: "Any valid title (1-255 chars) → always 201; invalid title → always 400"

### Traditional Test Pattern (Optional, for documentation)

```java
@SpringBootTest
@AutoConfigureMockMvc
class IncidentControllerIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void createIncident_withValidPayload_shouldReturn201() throws Exception {
        mvc.perform(post("/api/incidents")
            .contentType(APPLICATION_JSON)
            .content("""
                {
                  "title": "Major Fire",
                  "description": "Downtown fire",
                  "severity": 80
                }
            """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title").value("Major Fire"));
    }
}
```

## Scope and Limitations

**IN SCOPE:**

- REST API contracts and status codes
- Validation rules and constraints (title length, severity ranges, etc.)
- Schema validation (response structure matches contract)
- Error messages clarity
- Authentication/authorization for endpoints

**OUT OF SCOPE:**

- Business logic (tested in unit tests)
- Full workflow end-to-end (tested in e2e tests)
- Database persistence behavior (tested in service-layer tests)
- Mobile-specific concerns

**NOT full end-to-end:**

- Services not integrated with each other
- External systems mocked where needed
- Kafka/SSE events tested separately

## Consequences

### Positive

- **Efficiency**: One property replaces 50+ hardcoded test cases
- **Coverage**: Discovers edge cases automatically (not reliant on developer imagination)
- **Deterministic**: Failing examples are replayed/shrunk for easy debugging
- **Fast**: Properties run 1000s of times in seconds; full test suite ~30-60s
- **Spring integration**: Works seamlessly with `@SpringBootTest`, `MockMvc`, `RestAssured`
- **IDE support**: Run properties directly from IDE with one-click debugging
- **Shrinking**: When a property fails, jqwik produces minimal failing example for diagnosis
- **Contract validation**: Directly validates ADR_REST_Endpoint_Standards constraints

### Negative / Trade-offs

- **Learning curve**: Team must understand property thinking (invariants vs. examples)
- **Debugging**: Property failures show generated inputs (need to understand generator constraints)
- **Test selection**: Not all tests should be properties (some cases too simple)
- **Performance in CI**: Properties run 1000+ times by default (can configure down to 100 for CI if needed)
- **Setup complexity**: TestContainers require Docker/container support in CI/CD

## Alternatives Considered

### junit-quickcheck

- **Pros**: Mature, Apache-licensed, similar syntax
- **Cons**: Less active maintenance, heavier IDE integration setup, less Spring-friendly
- **Why not chosen**: jqwik is more actively maintained and has better Spring integration

### Manual test case explosion

- **Pros**: No framework learning curve, familiar to all developers
- **Cons**: Maintenance nightmare, misses edge cases, doesn't scale, cannot meet rubric 80%
- **Why not chosen**: Does not meet rubric requirements for comprehensive testing

### WebSockets instead of SSE for notifications

- **Pros**: Bidirectional communication
- **Cons**: More complex to test, heavier client/server protocol
- **Why not chosen**: Property-based testing better suited for SSE/HTTP patterns; WebSocket testing is separate concern

## Validation / Testing

**Phase 1 Task 1 - Completed:**

- ✅ jqwik 1.8.5, RestAssured 5.4.0, TestContainers 1.19.7 added to incident-service
- ✅ Sample `IncidentControllerPropertyTest.java` created with 3 property methods
- ✅ `mvn test-compile` succeeds (compilation verified)
- ✅ ADRs standardized and organized by domain

**Phase 1 Task 2-6 - Planned:**

- Replicate dependencies to remaining services (municipality, chat, notification, user, resource, region, department)
- Extend properties for all API endpoints
- Define integration test strategy document (Phase 1 Task 2)
- Set up test environment with TestContainers (Phase 1 Task 3)
- Create base integration test structure (Phase 1 Task 4)
- Implement property-based API contracts (Phase 1 Task 5)
- Wire Failsafe Maven plugin for CI/CD (Phase 1 Task 6)

## Properties to Validate (per Service)

### Incident Service

- Valid title (1-255 chars) → 201 Created
- Invalid title (empty or >255) → 400 Bad Request
- Severity in range (0-100) → 201
- Severity out of range → 400
- GET /incidents/{id} with valid id → 200 + valid schema
- GET /incidents/{id} with invalid id → 404
- Update incident with valid data → 200
- Delete existing incident → 204

### Municipality Service

- Valid municipality name → 201
- Parent region must exist → 400 if region invalid
- Name length constraints enforced
- Listing municipalities with pagination
- Delete cascade behavior

### Chat Service

- Valid message content (1-5000 chars) → 201
- Empty message → 400
- SSE connection authenticated
- Message persistence validated

### Notification Service

- SSE subscription authenticated
- Event payload matches schema
- Reconnection after disconnect
- Message ordering from Kafka

## References

- [jqwik Documentation](https://jqwik.net/)
- [jqwik Spring Integration Guide](https://jqwik.net/docs/current/user-guide.html#spring-boot)
- [jqwik GitHub](https://github.com/jlink/jqwik)
- [RestAssured Documentation](https://rest-assured.io/)
- [TestContainers Documentation](https://testcontainers.com/)
- [Spring Boot Testing Guide](https://spring.io/guides/gs/testing-web/)
- [Property-Based Testing Introduction](https://hypothesis.works/articles/what-is-property-based-testing/)
- ADR_REST_Endpoint_Standards
- Phase 1 Implementation: [Integration Testing Plan](../../Integration_testing.md)
- Example Implementation: `incident-service/src/test/java/.../IncidentControllerPropertyTest.java`

---

**Originally Proposed By:** Backend Architecture Team  
**Last Updated:** 2025-12-12
