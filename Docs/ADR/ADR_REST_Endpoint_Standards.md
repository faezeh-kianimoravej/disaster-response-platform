# ADR: REST Endpoint Standards

**Status:** Accepted  
**Date:** 2025-10-20  
**Context:** Sprint 05 - API Standardization

## Decision

All microservices follow consistent RESTful endpoint patterns.

## Endpoint Structure

| Operation | Pattern | Example |
|-----------|---------|---------|
| **Collection** | `GET /` | `GET /api/municipalities` |
| **Single Resource** | `GET /{id}` | `GET /api/municipalities/1` |
| **Create** | `POST /` | `POST /api/municipalities` |
| **Update** | `PUT /{id}` | `PUT /api/municipalities/1` |
| **Delete** | `DELETE /{id}` | `DELETE /api/municipalities/1` |
| **Nested Collection** | `GET /{id}/children` | `GET /api/regions/1/municipalities` |
| **Query by Parent** | `GET /parent/{parentId}` | `GET /api/departments/municipality/1` |

## Rules

1. **Base path** = resource name in plural (e.g., `/municipalities`, `/departments`)
2. **No verbs** in URLs (use HTTP methods instead)
3. **IDs in path**, not query params for single resources
4. **Nested resources** for one-level relationships only

## Rationale

- **Consistency** across all services (region, municipality, department, resource)
- **Predictability** for frontend developers
- **Industry standards** alignment (REST best practices)
- **Simplicity** - fewer endpoint variations to remember

## Impact

### Changed Endpoints

**Municipality Service:**
- ~~`/all`~~ → `/`
- ~~`/create`~~ → `/`
- ~~`/update/{id}`~~ → `/{id}`
- ~~`/delete/{id}`~~ → `/{id}`

**Department Service:**
- ~~`/all_departments`~~ → `/`
- ~~`/by-municipality/{id}`~~ → `/municipality/{id}`

### Frontend Updated

- `municipality.ts` - Updated API calls
- `department.ts` - Updated API calls

### Tests Updated

- `DepartmentServiceImplTest`
- `MunicipalityServiceImplTest`
- `MunicipalityServiceIntegrationTest`

## Consequences

✅ **Positive:**
- Single, clear standard for all endpoints
- Easier onboarding for new developers
- Frontend code more maintainable

⚠️ **Trade-offs:**
- Breaking change (requires frontend update)
- Required test updates

## Related

- [ADR: One-Level Nesting Pattern](./ADR_One_Level_Nesting_Pattern.md)
