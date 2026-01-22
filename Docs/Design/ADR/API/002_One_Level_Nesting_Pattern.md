# ADR: One-Level Nesting Pattern for REST APIs

**Status:** Accepted  
**Date:** 2025-10-20
**Sprint:** 05
**Related ADRs:** ADR_REST_Endpoint_Standards

## Context

The microservices architecture consists of hierarchical entities (Region → Municipality → Department → Resource). Initial implementation had inconsistent nesting:

- Deep nesting caused large payloads and performance issues
- Inconsistent patterns: some endpoints returned full nested objects, others just IDs
- Collection endpoints included unnecessary nested data

## Decision

Adopt a **Consistent One-Level Nesting Pattern**:

### Rules

1. **Collection endpoints** return summary DTOs without children

   ```text
   GET /api/regions → List<RegionSummaryDto> (no municipalities)
   ```

2. **Single-resource endpoints** return full DTO with **one level** of child summaries

   ```text
   GET /api/regions/1 → RegionDto + List<MunicipalitySummaryDto>
   ```

3. **Summary DTOs** contain only display essentials (ID, name, image)

4. **Leaf-level resources** (Department → Resource) can include full child objects

## Implementation

### DTO Structure

| Service      | Summary DTO              | Full DTO          | Children                       |
| ------------ | ------------------------ | ----------------- | ------------------------------ |
| Region       | `RegionSummaryDto`       | `RegionDto`       | `List<MunicipalitySummaryDto>` |
| Municipality | `MunicipalitySummaryDto` | `MunicipalityDto` | `List<DepartmentSummaryDto>`   |
| Department   | `DepartmentSummaryDto`   | `DepartmentDto`   | `List<ResourceDto>` (full)     |

### Example Response

**Collection (lightweight):**

```json
GET /api/regions
[
  { "regionId": 1, "name": "IJsselland", "image": "..." }
]
```

**Single Resource (one level down):**

```json
GET /api/regions/1
{
  "regionId": 1,
  "name": "IJsselland",
  "image": "...",
  "municipalities": [
    {
      "municipalityId": 41,
      "regionId": 1,
      "name": "Deventer",
      "image": "..."
    }
  ]
}
```

### Service Layer Pattern

```java
// Collection - no children, no Feign calls
public List<RegionSummaryDto> getAllRegions() {
    return repository.findAllRegions()
        .stream()
        .map(mapper::toSummaryDto)
        .collect(Collectors.toList());
}

// Single resource - fetch child summaries via Feign
public RegionDto getRegionById(Long id) {
    Region region = repository.findById(id).orElseThrow();
    RegionDto dto = mapper.toDto(region);
    List<MunicipalitySummaryDto> municipalities =
        municipalityClient.getMunicipalitiesByRegion(id);
    return new RegionDto(dto.regionId(), dto.name(), dto.image(), municipalities);
}
```

### Mapper Convention

Each mapper provides two methods:

- `toDto(Entity)` - Full DTO (children populated by service)
- `toSummaryDto(Entity)` - Summary DTO (no children)

## Rationale

The one-level nesting pattern balances performance, usability, and consistency:

**Performance Benefits:**

- Collection endpoints are lightweight (no nested data) - fast response times
- Single-resource endpoints include one level of children - reduces round trips
- Bounded response sizes prevent payload bloat
- No N+1 query problems with proper service layer orchestration

**Usability:**

- Predictable pattern: collections are summaries, single resources include children
- Child summaries provide essential context (IDs, names) without extra requests
- Frontend can display parent-child relationships without additional API calls

**Consistency:**

- All services follow same pattern (Region, Municipality, Department)
- Summary DTOs always contain ID, name, image (display essentials)
- Full DTOs always include one level of child summaries

**Alternative Approaches Avoided:**

- Deep nesting (Region → Municipality → Department → Resource) causes large payloads and performance issues
- No nesting forces frontend to make multiple sequential requests
- Inconsistent nesting patterns confuse developers

## Consequences

### Positive

- ✅ Consistent, predictable API pattern across all services
- ✅ Fast collection endpoints (no nested data, no database joins)
- ✅ Bounded response sizes prevent payload bloat
- ✅ Child summaries provide context without extra requests
- ✅ No N+1 query problems with proper service layer design
- ✅ Frontend displays parent-child relationships efficiently

### Negative / Trade-offs

- ❌ Requires both summary and full DTOs per entity (more code)
- ❌ Service layer must orchestrate Feign calls for child summaries
- ❌ Breaking change for existing clients expecting deep nesting
- ❌ More DTOs to maintain (Summary + Full for each entity)
- ❌ Feign calls on single resources add latency (mitigated by caching)

## Alternatives Considered

### Alternative 1: Deep Nesting (All Levels)

- Return full hierarchy: Region → Municipality → Department → Resource
- **Pros**: Single request for full hierarchy
- **Cons**: Massive payloads, slow response times, over-fetching
- **Why not chosen**: Performance unacceptable; most clients don't need full hierarchy

### Alternative 2: No Nesting (IDs Only)

- Return only IDs for child entities, no embedded objects
- **Pros**: Smallest payloads
- **Cons**: Frontend must make multiple sequential requests; poor UX
- **Why not chosen**: Too many round trips; frontend complexity increased

### Alternative 3: GraphQL

- Let clients specify exactly which fields/relationships to fetch
- **Pros**: Maximum flexibility
- **Cons**: Higher complexity, learning curve, infrastructure overhead
- **Why not chosen**: REST is sufficient for current needs; team expertise in REST

## Implementation Details

### DTO Structure

| Service      | Summary DTO              | Full DTO          | Children                       |
| ------------ | ------------------------ | ----------------- | ------------------------------ |
| Region       | `RegionSummaryDto`       | `RegionDto`       | `List<MunicipalitySummaryDto>` |
| Municipality | `MunicipalitySummaryDto` | `MunicipalityDto` | `List<DepartmentSummaryDto>`   |
| Department   | `DepartmentSummaryDto`   | `DepartmentDto`   | `List<ResourceDto>` (full)     |

### Service Layer Pattern

```java
// Collection - no children, no Feign calls
public List<RegionSummaryDto> getAllRegions() {
    return repository.findAllRegions()
        .stream()
        .map(mapper::toSummaryDto)
        .collect(Collectors.toList());
}

// Single resource - fetch child summaries via Feign
public RegionDto getRegionById(Long id) {
    Region region = repository.findById(id).orElseThrow();
    RegionDto dto = mapper.toDto(region);
    List<MunicipalitySummaryDto> municipalities =
        municipalityClient.getMunicipalitiesByRegion(id);
    return new RegionDto(dto.regionId(), dto.name(), dto.image(), municipalities);
}
```

### Mapper Convention

Each mapper provides two methods:

- `toDto(Entity)` - Full DTO (children populated by service)
- `toSummaryDto(Entity)` - Summary DTO (no children)

## Validation / Testing

Validation through:

- **Integration tests**: Verify collection endpoints return summaries only
- **Integration tests**: Verify single-resource endpoints include one level of children
- **Property-based tests**: Validate DTO structure matches schema
- **Performance tests**: Measure response times for collections vs. single resources
- **Manual testing**: Use curl to verify response shapes

**Example Manual Tests:**

```bash
# Collection - should return summaries
curl http://localhost:8083/api/regions

# Single resource - should include one level of children
curl http://localhost:8083/api/regions/1

# Verify child summaries are minimal (ID, name, image only)
curl http://localhost:8082/api/municipalities/41

# Leaf resources can include full children
curl http://localhost:8081/api/departments/101
```

## References

- ADR_REST_Endpoint_Standards
- [REST API Best Practices](https://restfulapi.net/)
- Example implementations: `region-service`, `municipality-service`, `department-service`

---

**Originally Proposed By:** Architecture Team  
**Last Updated:** 2025-12-12
