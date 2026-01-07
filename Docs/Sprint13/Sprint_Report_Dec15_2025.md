
# Sprint Report – Sprint X

## Sprint Goal

Improve system quality, architectural clarity, and production readiness by establishing the foundation for integration testing, fixing critical SSE communication issues, finalizing key architecture documentation, and aligning frontend–backend interaction flows.

---

## Team Roles

- **Scrum Master:** Ben Vos  
- **Product Owner:** Ivo van Hurne  
- **Team Members:** Ben, Sepideh, Faezeh, Furqan  

---

## Sprint Dates

- **Sprint duration:** December 15 – December 22, 2025

---

## Sprint Backlog & Progress

Completed items in this sprint:

- [x] ADD – Frontend Mobile App Architecture  
- [x] ADD – Microservices Boundaries and Organization Service Definition  
- [x] Phase 1 – Select Property-Based Testing Framework  
- [x] Integration Testing Phase 1  
- [x] Design flow and interface  
- [x] Bug – Notification SSE endpoints return 401 Unauthorized  
- [x] Bug – Chat SSE unauthorized, message duplication, and missing "You" identifier  

---

## Cycle Time

Calculation method: calendar days

| Item | Type | Start | Done | Cycle Time (days) |
|------|------|--------|-------|-------------------|
| ADD – Frontend Mobile App Architecture | Documentation | 2025-12-17 | 2025-12-18 | 2 |
| ADD – Microservices Boundaries & Organization Service | Documentation | 2025-12-15 | 2025-12-17 | 3 |
| Phase 1 – Select Property-Based Testing Framework | Research / QA | 2025-12-16 | 2025-12-17 | 2 |
| Integration Testing Phase 1 | Enhancement | 2025-12-16 | 2025-12-18 | 3 |
| Design flow and interface | Design | 2025-12-16 | 2025-12-17 | 2 |
| Bug – Notification SSE 401 | Bug | 2025-12-18 | 2025-12-18 | 1 |
| Bug – Chat SSE issues | Bug | 2025-12-18 | 2025-12-18 | 1 |

### Summary Metrics

- Number of completed items: **7**  
- Total cycle time: **14 days**  
- Average cycle time: **2.0 days**  
- Median cycle time: **2 days**  

---

## Strategic & Technical Achievements

### Architecture & Documentation

- Finalized **Microservices Boundaries and Organization Service Definition**, clarifying:
  - Service responsibilities
  - Data ownership
  - Inter-service communication boundaries
- Created **Frontend Mobile App Architecture ADD**, establishing:
  - Structure of the mobile app
  - Communication patterns with backend
  - Guidelines for scalability and maintainability

### Testing & Quality Foundation

- Selected a **Property-Based Testing Framework** as the foundation for:
  - Contract testing
  - Input-space exploration
  - Future resilience testing
- Implemented **Integration Testing Phase 1**:
  - Set up integration test infrastructure
  - Enabled cross-service flow verification
  - Established the first quality gate for system-level behavior

### Design Alignment

- Finalized **design flow and interface**:
  - Aligned frontend flows with backend APIs
  - Reduced ambiguity in user journeys
  - Improved shared understanding between frontend and backend

### Critical Bug Fixes (SSE & Realtime)

- Fixed **Notification SSE 401 Unauthorized via API Gateway**
- Fixed **Chat SSE issues**:
  - Unauthorized access
  - Message duplication
  - Missing "You" identifier

These fixes significantly improved **system reliability and real-time communication stability**.

---

## Sprint Conclusion

This sprint focused on **quality, stability, and architectural maturity** rather than feature quantity.

Key outcomes:

- Architecture is now formally documented and aligned  
- Integration testing foundation is in place  
- Real-time communication bugs are fixed  
- Frontend–backend contract clarity is significantly improved  

Overall, this sprint **substantially increased production readiness and technical confidence for future releases**.
