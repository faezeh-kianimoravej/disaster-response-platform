# ADR: Organizational Hierarchy Microservice Consolidation

**Status:** Proposed  
**Date:** 2025-12-05  
**Sprint:** 11  
**Related ADRs:** ADR_REST_Endpoint_Standards, ADR_Controller_Integration_Testing

## Context

The current architecture separates organizational hierarchy management across three independent microservices:

- **Region Service** (`/api/regions`) - Manages regions and their municipalities
- **Municipality Service** (`/api/municipalities`) - Manages municipalities and their departments
- **Department Service** (`/api/departments`) - Manages departments (linked to resources)

**Note:** Resource Service is a separate, legitimate microservice with independent business logic and is NOT being consolidated.

**Identified Problems:**

1. **Artificial Service Boundaries:** The three services (Region, Municipality, Department) represent a single organizational hierarchy domain. They have no independent business logic and are tightly coupled.
   - The organizational structure hierarchy is: **Region → Municipality → Department**
   - Resources are referenced BY departments but managed independently by Resource Service

2. **Inter-service Coupling:** Strong coupling exists:

   - Municipality Service directly queries Region Service
   - Department Service directly queries Municipality Service
   - Circular dependencies and tight coupling between services

3. **Shared Data Model:** All three manage hierarchical organizational structures with nearly identical patterns:

   - CRUD operations on entities
   - Nested hierarchy management
   - Similar security and access control requirements

4. **Code Duplication:** Similar patterns repeated across three codebases:

   - Controllers with identical structure (GET all, GET by ID, POST, PUT, DELETE)
   - Services with similar business logic
   - Repositories with similar queries
   - Exception handling and mappers are duplicated

5. **Operational Overhead:** Separate services require:

   - Three databases to manage
   - Three sets of configuration (port, logging, etc.)
   - Three separate discovery entries
   - Three separate test suites

6. **Bounded Context Identification:** Domain-driven design analysis reveals a single bounded context:
   - **Bounded Context: "Organizational Structure"**
   - Ubiquitous Language: Region, Municipality, Department
   - Aggregate Root: Region (with nested aggregates Municipality and Department)
   - Domain Logic: Hierarchical relationships and structural integrity
   - **NOTE:** Resource Service is a separate bounded context (Resource Management) and remains independent

### Current Service Responsibilities

**Region Service:**

```java
GET    /api/regions                           // Get all regions (summary)
GET    /api/regions/{regionId}                // Get region with municipalities
POST   /api/regions                           // Create region
PUT    /api/regions/{regionId}                // Update region
DELETE /api/regions/{regionId}                // Delete region
GET    /api/regions/{regionId}/municipalities // Get municipalities in region
```

**Municipality Service:**

```java
GET    /api/municipalities                    // Get all municipalities (summary)
GET    /api/municipalities/{id}               // Get municipality with departments
POST   /api/municipalities                    // Create municipality
PUT    /api/municipalities/{id}               // Update municipality
DELETE /api/municipalities/{id}               // Delete municipality
GET    /api/municipalities/{id}/departments   // Get departments in municipality
```

**Department Service:**

```java
GET    /api/departments                       // Get all departments (summary)
GET    /api/departments/{id}                  // Get department details
POST   /api/departments                       // Create department
PUT    /api/departments/{id}                  // Update department
DELETE /api/departments/{id}                  // Delete department
GET    /api/departments/{id}/resources        // Get resources assigned to department (calls Resource Service)
GET    /api/departments/municipality/{id}     // Get departments by municipality
```

### Inter-service Communication

```text
Client-App
  ├─ API Gateway routes to individual services
  ├─ Region Service → queries Municipality Service → queries Department Service
  └─ Department Service → queries back to Municipality Service
```

**Issues:**

- Three separate HTTP calls to fetch complete hierarchy
- Cascading failures (if Municipality Service down, Region endpoints partially fail)
- Latency increases with nested hierarchy queries
- Additional network I/O overhead

## Decision

### 1. Consolidate Into Single "Organization Service"

**New Structure:**

```text
organization-service/
├── src/main/java/nl/saxion/disaster/organizationservice/
│   ├── controller/
│   │   ├── RegionController.java
│   │   ├── MunicipalityController.java
│   │   └── DepartmentController.java
│   ├── service/
│   │   ├── RegionService.java
│   │   ├── MunicipalityService.java
│   │   ├── DepartmentService.java
│   │   └── contract/
│   │       ├── IRegionService.java
│   │       ├── IMunicipalityService.java
│   │       └── IDepartmentService.java
│   ├── dto/
│   │   ├── RegionDto.java
│   │   ├── MunicipalityDto.java
│   │   ├── DepartmentDto.java
│   │   └── ...
│   ├── model/
│   │   ├── entity/
│   │   │   ├── Region.java
│   │   │   ├── Municipality.java
│   │   │   └── Department.java
│   │   └── ...
│   ├── repository/
│   │   ├── RegionRepository.java
│   │   ├── MunicipalityRepository.java
│   │   └── DepartmentRepository.java
│   ├── mapper/
│   │   ├── RegionMapper.java
│   │   ├── MunicipalityMapper.java
│   │   └── DepartmentMapper.java
│   ├── exception/
│   │   ├── RegionNotFoundException.java
│   │   ├── MunicipalityNotFoundException.java
│   │   └── DepartmentNotFoundException.java
│   └── OrganizationServiceApplication.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       └── V001_organizational_schema.sql
├── pom.xml
└── Dockerfile
```

**API Endpoints (Unchanged from Client Perspective):**

```java
// All endpoints remain available and unchanged
GET    /api/regions
GET    /api/regions/{regionId}
POST   /api/regions
PUT    /api/regions/{regionId}
DELETE /api/regions/{regionId}
GET    /api/regions/{regionId}/municipalities

GET    /api/municipalities
GET    /api/municipalities/{id}
POST   /api/municipalities
PUT    /api/municipalities/{id}
DELETE /api/municipalities/{id}
GET    /api/municipalities/{id}/departments

GET    /api/departments
GET    /api/departments/{id}
POST   /api/departments
PUT    /api/departments/{id}
DELETE /api/departments/{id}
GET    /api/departments/{id}/resources
GET    /api/departments/municipality/{id}
```

**Rationale:**

- ✅ Controllers remain separate for clear API organization
- ✅ Services remain separate but now co-located in same codebase
- ✅ Repositories now share same database connection (same transaction context)
- ✅ DTOs and Mappers centralized and deduplicated
- ✅ Business logic can be cross-service without network calls
- ✅ No client changes needed

---

### Important: Why Resource Service is NOT Consolidated

**Resource Service is intentionally kept separate because:**

1. **Independent Business Logic:**
   - Resource Service manages: allocation, availability tracking, scheduling, maintenance state
   - Organization Service manages: hierarchical structure only
   - Different domains with different concerns

2. **Cross-service Usage:**
   - Resource Service is queried by:
     - Department Service (departments have resources)
     - Incident Service (incidents request resources)
     - Deployment Service (deployments allocate resources)
   - Organization Service is NOT used by these other services
   - Consolidating would create unwanted coupling

3. **Different Scalability Patterns:**
   - Organization data: relatively static (regions/municipalities/departments change rarely)
   - Resource data: highly dynamic (allocations, availability updated frequently)
   - Different scaling and caching strategies appropriate

4. **Separate Aggregate:**
   - Organization: Region (aggregate root) → Municipality → Department
   - Resource: Resource (aggregate root) — independent
   - These are separate aggregates in separate bounded contexts

5. **API Behavior:**
   - `GET /api/departments/{id}/resources` will still work in Organization Service
   - It will delegate to Resource Service via HTTP or event-driven communication
   - Clients see no change

**Relationship Between Services:**
```
Organization Service (Organizational Structure)
  ├─ Manages: Regions, Municipalities, Departments
  └─ References: Resources (from Resource Service)

Resource Service (Resource Management)
  ├─ Manages: Resources, Allocations, Availability
  └─ Receives queries from: Department Service, Incident Service, Deployment Service
```
- ✅ Single deployment unit
- ✅ No client changes needed

---

### 2. Merge Databases into Single Schema

**Current State (3 Databases):**

```text
region_db:        REGIONS, MUNICIPALITIES
municipality_db:  MUNICIPALITIES, DEPARTMENTS
department_db:    DEPARTMENTS, RESOURCES_MAPPING
```

**New State (1 Database):**

```text
organization_db:
├── REGIONS                 (from region_db)
├── MUNICIPALITIES          (from municipality_db)
├── DEPARTMENTS            (from department_db)
└── ORGANIZATIONAL_HIERARCHY (new table for data integrity)
```

**Migration Strategy:**

1. Create new `organization_db` with combined schema
2. ETL data from three old databases to new database
3. Deploy Organization Service with new database
4. Keep old services running in read-only mode during transition
5. Verify data integrity
6. Decommission old services and databases

**Schema Changes:**

```sql
-- Combined organizational hierarchy
CREATE TABLE regions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE municipalities (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id BIGINT NOT NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE departments (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    municipality_id BIGINT NOT NULL,
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id)
);

-- Resources linked to departments
CREATE TABLE resources (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Audit/integrity tracking
CREATE TABLE organizational_hierarchy_audit (
    id BIGINT PRIMARY KEY,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    action VARCHAR(20),
    timestamp DATETIME,
    user_id BIGINT
);
```

**Rationale:**

- ✅ Single transaction context for hierarchical operations
- ✅ Foreign key constraints ensure data integrity
- ✅ Better query performance (joins instead of HTTP calls)
- ✅ Simplified backup and recovery
- ✅ Easier data consistency checks

---

### 3. Consolidate Configuration and Deployment

**Single Configuration:**

```yaml
# organization-service/src/main/resources/application.yml
spring:
  application:
    name: organization-service
  jpa:
    hibernate:
      ddl-auto: validate
  datasource:
    url: jdbc:mysql://organization-db:3306/organization_db
    username: ${DB_USER}
    password: ${DB_PASSWORD}

server:
  port: 8093
  servlet:
    context-path: /

management:
  endpoints:
    web:
      exposure:
        include: health,metrics

# Logging for all modules
logging:
  level:
    nl.saxion.disaster.organizationservice: INFO
```

**Docker Compose (Single Service Entry):**

```yaml
organization-service:
  build: ./organization-service
  ports:
    - "8093:8093"
  environment:
    DB_USER: org_user
    DB_PASSWORD: ${DB_PASSWORD}
  depends_on:
    - organization-db
  networks:
    - drccs-network

organization-db:
  image: mysql:8.0
  environment:
    MYSQL_DATABASE: organization_db
    MYSQL_USER: org_user
    MYSQL_PASSWORD: ${DB_PASSWORD}
    MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  volumes:
    - org-data:/var/lib/mysql
  networks:
    - drccs-network
```

---

### 4. Maintain API Contract Consistency

**From Client Perspective:**

- All endpoints remain at same paths
- All DTOs remain unchanged
- All status codes unchanged
- All error handling unchanged

**Breaking Changes (None):**

- ✅ Zero breaking changes to API contract
- ✅ Client applications (web, responder app, citizen app) require no changes

**Internal Changes Only:**

- How services communicate (in-process vs. HTTP)
- Where data is stored (single database vs. multiple)
- Where code lives (single repository vs. three)

---

## Rationale

The decision to consolidate these three services is driven by domain-driven design principles:

**Single Bounded Context:**

- Region, Municipality, and Department represent a single domain: "Organizational Structure"
- All three entities share the same ubiquitous language and business rules
- They form a natural aggregate with Region as the root

**Eliminate Artificial Boundaries:**

- Current service boundaries are artificial - no independent business logic in each service
- Services are tightly coupled through HTTP calls (Municipality queries Region, Department queries Municipality)
- Data model is hierarchical and naturally belongs together

**Improved Data Consistency:**

- Single database enables proper foreign key constraints
- Transactions can span organizational hierarchy (create region + municipalities in one atomic operation)
- No eventual consistency issues from distributed data

**Performance Benefits:**

- In-process method calls instead of HTTP round-trips
- Database joins instead of multiple HTTP calls
- Reduced network I/O and serialization overhead
- Lower latency for hierarchical queries

**Operational Simplicity:**

- One service to deploy, monitor, scale, and maintain instead of three
- Single database backup and recovery
- Simplified configuration and logging

**Alignment with Best Practices:**

- DDD: Bounded contexts should align with business domains, not technical layers
- Microservices pattern: Services should have independent business logic
- Current setup violates both principles - consolidation fixes this

## Consequences

### Positive Consequences

**Operational:**

- ✅ **Single Deployment Unit** - Deploy once instead of three times
- ✅ **Single Database** - Simpler backup, recovery, monitoring
- ✅ **Lower Operational Overhead** - 1 service in production vs. 3
- ✅ **Reduced Latency** - In-process calls instead of HTTP round-trips
- ✅ **Better Data Consistency** - Single transaction context for hierarchical operations
- ✅ **Easier Scaling** - Scale one service instead of managing three

**Development:**

- ✅ **Code Sharing** - No duplication of CRUD patterns, mappers, exception handlers
- ✅ **Single Test Suite** - Integration tests run once
- ✅ **Easier Refactoring** - Move code within single codebase vs. across three repos
- ✅ **Consistent Patterns** - One way to handle validation, logging, error handling
- ✅ **Faster Feature Development** - Changes affecting multiple entities don't require inter-service coordination

**Architecture:**

- ✅ **Aligned with DDD** - Single bounded context properly encapsulated
- ✅ **Reduced Network Complexity** - No distributed system challenges for hierarchical queries
- ✅ **Improved Observability** - Single application logs and metrics
- ✅ **Better Performance** - Join queries faster than HTTP + serialization

---

### Negative Consequences

**Scale (Future):**

- ⚠️ **Single Service Bottleneck** - If organizational hierarchy queries become high-volume, must split later
- ⚠️ **Single Database Bottleneck** - If organizational data grows very large, may need sharding later
- ⚠️ **Shared Resource Pool** - All three domain areas compete for CPU/memory

**Deployment:**

- ❌ **Bigger Artifact** - JAR file slightly larger (combining three services)
- ❌ **Refactoring Needed** - Migration effort to consolidate code

---

## Alternatives Considered

### Alternative 1: Keep Services Separate with Shared Library

- Create `@drccs/organization-shared` package with common code
- Services share DTOs, exceptions, mappers
- **Rejected because:** Still have inter-service coupling, still requires HTTP calls, doesn't solve root problem

### Alternative 2: Keep Services, Add Sync Microservice

- Create "Organizational Sync Service" to keep three databases in sync
- Services remain independent
- **Rejected because:** Adds complexity, doesn't solve fundamental problem, increased latency

## Implementation Details

### Service Structure

The consolidated organization-service contains three distinct controllers, services, and repositories:

- **Controllers**: RegionController, MunicipalityController, DepartmentController
- **Services**: RegionService, MunicipalityService, DepartmentService
- **Repositories**: RegionRepository, MunicipalityRepository, DepartmentRepository
- **DTOs**: Separate DTOs for each entity (full and summary versions)
- **Mappers**: Entity-to-DTO mapping for each domain object

### Database Consolidation

**Migration Steps:**

1. Create new `organization_db` with combined schema
2. ETL data from three old databases (region_db, municipality_db, department_db)
3. Deploy Organization Service with new database connection
4. Keep old services in read-only mode during transition
5. Verify data integrity with comparison queries
6. Decommission old services and databases

**Schema:**

```sql
CREATE TABLE regions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE municipalities (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id BIGINT NOT NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE departments (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    municipality_id BIGINT NOT NULL,
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id)
);
```

### API Contract Preservation

**Guarantee**: 100% backward compatible

- All URLs remain unchanged (`/api/regions`, `/api/municipalities`, `/api/departments`)
- All HTTP methods remain unchanged
- All request/response DTOs remain unchanged
- All error codes and messages remain unchanged
- Client applications require ZERO changes

### Bounded Context Analysis

**Organizational Structure Bounded Context:**

- **Core Entities**: Region, Municipality, Department
- **Aggregate Root**: Region (with nested aggregates)
- **Ubiquitous Language**: Hierarchy, containment, authority
- **Domain Events**: RegionCreated, MunicipalityAddedToRegion, DepartmentAddedToMunicipality
- **Policies**: Region cannot be deleted if it contains active municipalities; municipalities/departments cannot exist without parents

**Note on Resources**: Departments reference resources, but resources are managed by the separate Resource Service bounded context (external aggregate reference, not owned).

## Validation / Testing

Implementation will be validated through:

- **Unit tests**: Service logic, mappers, DTOs
- **Integration tests**: Controller endpoints with TestContainers (PostgreSQL)
- **Property-based tests**: Hierarchical integrity constraints using jqwik
- **API contract tests**: All endpoints return same responses as before consolidation
- **Performance tests**: Compare latency before/after consolidation
- **Data migration validation**: Verify all data migrated correctly with checksums
- **Backward compatibility tests**: Run existing client integration tests against new service

**Success Criteria:**

- All existing integration tests pass without modification
- API response times improve by ≥20%
- Data integrity verified (no data loss during migration)
- Single database backup/restore successful



## References

- [Domain-Driven Design (Evans, 2003)](https://www.domainlanguage.com/ddd/) — Bounded Contexts chapter
- [Building Microservices (Newman, 2015)](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/) — Service Boundaries section
- [Microservices Anti-patterns](https://microservices.io/patterns/index.html)
- ADR_REST_Endpoint_Standards
- ADR_Controller_Integration_Testing
- Example implementation: `backend-app/organization-service/`

---

**Originally Proposed By:** Backend Architecture Team  
**Last Updated:** 2025-12-12
