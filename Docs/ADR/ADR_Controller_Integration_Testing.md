# Controller Integration Testing Strategy

## Context
The Disaster Response system consists of multiple Spring Boot microservices
exposing REST APIs. These APIs form the primary contract between services and
frontend clients, making their correctness critical.

## Test Type
The tests implemented for controllers are **integration tests at the web layer**.

They verify the integration between:
- Spring MVC request handling
- Controller mappings
- Validation and serialization
- HTTP status codes and response bodies

The service layer is mocked, and no real database or external systems are involved.

## Decision
Controller integration tests are implemented using:

- `@WebMvcTest` to load the Spring MVC layer
- `MockMvc` to simulate HTTP requests
- `@MockBean` to replace service dependencies
- JSON assertions to validate API contracts

Security filters are either disabled or replaced with a lightweight test
configuration where required (e.g. JWT or SSE endpoints).

## Rationale
This approach was chosen because it:

- Validates REST API contracts without starting the full application
- Keeps tests fast and deterministic
- Avoids dependency on databases (e.g. H2) or infrastructure
- Clearly separates API testing from business logic testing

## Scope and Limitations
- Business logic is **not** tested here and is covered by unit tests
- Persistence behavior is tested separately (if required)
- These tests do **not** represent full end-to-end system tests

## Consistency
All controller integration tests across services follow this same pattern to
ensure consistency and maintainability.
