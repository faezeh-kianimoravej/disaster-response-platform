# Architecture Decision Records (ADRs)

This directory contains all Architecture Decision Records for the Disaster Response Coordination and Communication System (DRCCS).

## Structure

ADRs are organized by domain area for easy navigation:

### 🔌 [API](./API/)

REST API design standards and patterns

- [001_REST_Endpoint_Standards](./API/001_REST_Endpoint_Standards.md) ✅ Accepted

  - Consistent RESTful endpoint patterns across all microservices
  - Naming conventions, HTTP methods, nested resources

- [002_One_Level_Nesting_Pattern](./API/002_One_Level_Nesting_Pattern.md)
  - Restriction to one level of resource nesting

---

### 🏗️ [Architecture](./Architecture/)

Core system architecture and service design decisions

- [001_Organization_Service_Consolidation](./Architecture/001_Organization_Service_Consolidation.md) 📋 Proposed

  - Consolidate Region, Municipality, Department services
  - Organizational hierarchy as single bounded context

- [002_Event_Driven_Notification_Workflow](./Architecture/002_Event_Driven_Notification_Workflow.md) ✅ Accepted
  - Kafka + SSE for real-time event-driven notifications
  - Event producers → Kafka → Notification Service → SSE clients

---

### ✅ [Testing](./Testing/)

Quality assurance and testing strategies

- [001_Integration_Testing_Strategy_with_Property_Based_Framework](./Testing/001_Integration_Testing_Strategy_with_Property_Based_Framework.md) ✅ Accepted
  - Property-based testing with jqwik 1.8.5 + RestAssured + TestContainers
  - Controller integration testing strategy (HTTP contracts, validation, constraints)
  - Test patterns and organization for all services

---

### 🎨 [Frontend](./Frontend/)

Client-side architecture and standards

- [001_Frontend_Standards](./Frontend/001_Frontend_Standards.md)

  - Frontend code standards and conventions

- [002_Mobile_App_Architecture](./Frontend/002_Mobile_App_Architecture.md)
  - Mobile application architecture decisions

---

## Status Legend

| Status        | Meaning                                    |
| ------------- | ------------------------------------------ |
| ✅ Accepted   | Decision is approved and being implemented |
| 📋 Proposed   | Decision under review, not yet accepted    |
| 🔄 Deprecated | Decision superseded by newer ADR           |
| 📝 Draft      | Work in progress                           |

## How to Use

1. **Find an ADR**: Look in the relevant domain folder
2. **Understand a Decision**: Each ADR contains:

   - **Context**: The problem or situation
   - **Decision**: What was chosen and why
   - **Rationale**: Reasoning behind the choice
   - **Consequences**: Trade-offs and impact
   - **Alternatives**: Options considered and why they weren't chosen
   - **References**: Related documentation and code

3. **Create New ADR**: Copy [ADR_Template.md](./ADR_Template.md) and follow the structure

4. **Update Links**: When referencing ADRs in code or docs, use links to these files

## Recent Updates

- **2025-12-12**: Restructured ADRs by domain, standardized format across all ADRs
- **2025-11-15**: Event-Driven Notification Workflow accepted (Sprint 07)
- **2025-11-10**: Controller Integration Testing Strategy with property-based testing (Sprint 06)
- **2025-10-20**: REST Endpoint Standards established (Sprint 05)

---

**Last Updated:** 2025-12-12
