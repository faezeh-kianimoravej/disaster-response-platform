# ADR: REST Endpoint Standards

**Status:** Accepted  
**Date:** 2025-10-20  
**Sprint:** 05
**Related ADRs:** ADR_Controller_Integration_Testing

## Context

Microservices across the system expose REST APIs that form the primary contract between services and frontend clients. Without standardization, inconsistent endpoint patterns lead to developer confusion, increased integration errors, and maintenance overhead. This ADR establishes a single pattern for all resource operations.

## Decision

All microservices follow consistent RESTful endpoint patterns based on resource collections and standard HTTP methods.

## Rationale

- **Consistency** across all services simplifies API integration
- **Predictability** for frontend developers reduces learning curve
- **Industry standards** alignment follows REST best practices
- **Simplicity** reduces cognitive load and endpoint variations

## Endpoint Structure

| Operation             | Pattern                  | Example                               |
| --------------------- | ------------------------ | ------------------------------------- |
| **Collection**        | `GET /`                  | `GET /api/municipalities`             |
| **Single Resource**   | `GET /{id}`              | `GET /api/municipalities/1`           |
| **Create**            | `POST /`                 | `POST /api/municipalities`            |
| **Update**            | `PUT /{id}`              | `PUT /api/municipalities/1`           |
| **Delete**            | `DELETE /{id}`           | `DELETE /api/municipalities/1`        |
| **Nested Collection** | `GET /{id}/children`     | `GET /api/regions/1/municipalities`   |
| **Query by Parent**   | `GET /parent/{parentId}` | `GET /api/departments/municipality/1` |

## Rules

1. **Base path** = resource name in plural (e.g., `/municipalities`, `/departments`)
2. **No verbs** in URLs (use HTTP methods instead)
3. **IDs in path**, not query params for single resources
4. **Nested resources** for one-level relationships only

## Consequences

### Positive

- Consistent patterns across all microservices
- Reduced learning curve for frontend integration
- Easier API documentation and discovery
- Aligns with industry REST standards
- Single, clear standard for all endpoints
- Easier onboarding for new developers
- Frontend code more maintainable

### Negative / Trade-offs

- Legacy endpoints require migration (refactored in Sprint 05)
- Nested resources limited to one level (encourages flattening where possible)
- Breaking change (requires frontend update)
- Required test updates

## Alternatives Considered

### Alternative 1: Keep Legacy Endpoints with Aliases

- Maintain both old and new endpoint patterns
- **Pros**: No breaking changes
- **Cons**: Technical debt accumulation, confusing for developers, inconsistent patterns
- **Why not chosen**: Does not solve the core problem of inconsistency

### Alternative 2: Use GraphQL Instead

- Replace REST with GraphQL for flexible querying
- **Pros**: More flexible for frontend, reduces over-fetching
- **Cons**: Higher learning curve, more complex infrastructure, overkill for current needs
- **Why not chosen**: REST is sufficient for current requirements; team expertise in REST

## Implementation Details

**Impact on Services:**

- **Municipality Service**: Refactored `/all` → `/`, `/create` → `/`, `/update/{id}` → `/{id}`, `/delete/{id}` → `/{id}`
- **Department Service**: Refactored `/all_departments` → `/`, `/by-municipality/{id}` → `/municipality/{id}`
- **Frontend**: Updated API calls in `municipality.ts` and `department.ts`
- **Tests**: Updated `DepartmentServiceImplTest`, `MunicipalityServiceImplTest`, `MunicipalityServiceIntegrationTest`

**Migration completed in Sprint 05**

## Validation / Testing

- Property-based tests validate endpoint contracts (see ADR_Controller_Integration_Testing)
- All endpoints return consistent status codes (201 for create, 200 for success, 404 for not found, etc.)
- Schema validation ensures request/response formats are predictable
- Integration tests verify all services follow the standard patterns

## References

- [REST API Best Practices](https://restfulapi.net/)
- [RESTful Web Services](https://en.wikipedia.org/wiki/Representational_state_transfer)
- ADR_Controller_Integration_Testing
- ADR_Organization_Service_Consolidation
- ADR_One_Level_Nesting_Pattern

---

**Originally Proposed By:** Architecture Team  
**Last Updated:** 2025-12-12
