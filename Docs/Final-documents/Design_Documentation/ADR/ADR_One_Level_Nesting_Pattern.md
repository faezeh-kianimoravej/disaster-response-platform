# Architectural Decision Record: One-Level Nesting Pattern for REST APIs

## Status
**Accepted** - October 20, 2025

## Context
The microservices architecture consists of hierarchical entities (Region → Municipality → Department → Resource). Initial implementation had inconsistent nesting:
- Deep nesting caused large payloads and performance issues
- Inconsistent patterns: some endpoints returned full nested objects, others just IDs
- Collection endpoints included unnecessary nested data

## Decision
Adopt a **Consistent One-Level Nesting Pattern**:

### Rules

1. **Collection endpoints** return summary DTOs without children
   ```
   GET /api/regions → List<RegionSummaryDto> (no municipalities)
   ```

2. **Single-resource endpoints** return full DTO with **one level** of child summaries
   ```
   GET /api/regions/1 → RegionDto + List<MunicipalitySummaryDto>
   ```

3. **Summary DTOs** contain only display essentials (ID, name, image)

4. **Leaf-level resources** (Department → Resource) can include full child objects

## Implementation

### DTO Structure

| Service | Summary DTO | Full DTO | Children |
|---------|-------------|----------|----------|
| Region | `RegionSummaryDto` | `RegionDto` | `List<MunicipalitySummaryDto>` |
| Municipality | `MunicipalitySummaryDto` | `MunicipalityDto` | `List<DepartmentSummaryDto>` |
| Department | `DepartmentSummaryDto` | `DepartmentDto` | `List<ResourceDto>` (full) |

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

## Consequences

### Positive
- ✅ Consistent, predictable API pattern
- ✅ Fast collection endpoints (no nested data)
- ✅ Bounded response sizes
- ✅ Child summaries provide context without extra requests
- ✅ No N+1 query problems

### Negative
- ❌ Requires both summary and full DTOs per entity
- ❌ Service layer must orchestrate Feign calls
- ❌ Breaking change for existing clients

### Trade-offs
- More DTOs ↔ Better performance
- Feign calls on single resources ↔ No calls on collections
- Two-step fetching ↔ Fast list views

## Validation

```bash
curl http://localhost:8083/api/regions          # Summaries
curl http://localhost:8083/api/regions/1        # Full + one level
curl http://localhost:8082/api/municipalities/41 # Full + one level
curl http://localhost:8081/api/departments/101   # Full + resources
```

