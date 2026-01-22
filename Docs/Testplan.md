# Strategic Testing & Quality Plan: Disaster Response System

**Status**: Active / In-Progress
**Date**: January 22, 2026
**Project Quartile**: Quartile 2 (Integration & Production Readiness)
**Related ADRs**:

* `ADR_REST_Endpoint_Standards.md` (API Contracts)
* `ADR_Notification_Workflow.md` (Event workflows)
* `ADR_Organization_Service_Consolidation.md` (Service boundaries)
* `ADR_Mobile_App_Architecture.md` (Frontend standards)

---

## 1. Quality Strategy & Risk Assessment

This plan follows a risk-prioritized approach, moving from example-based testing to a model where automated validation justifies the system's "fitness" against Master-level quality standards. We prioritize resources based on the architectural impact of failure.

### 1.1 Risk Assessment Matrix

| Risk Area | Why it is a risk (Impact) | Mitigation (The "What") |
| :--- | :--- | :--- |
| **Real-time Availability** | SSE connection failures lead to responders missing life-critical crisis updates. | Automated **JMeter** performance tests and **Property-Based Testing** for SSE lifecycle and message ordering. |
| **Cross-Service Integrity** | High numbers of "tiny" services lose referential integrity, leading to data orphans. | **ArchUnit** fitness functions to enforce bounded context isolation and layer rules. |
| **Auth Propagation** | Unauthorized access to chat or notifications exposes sensitive data. | **Integration tests** using **TestContainers** with real Keycloak instances for auth flow validation. |
| **State Consistency** | Invalid user flows in the UI lead to data corruption in the incident lifecycle. | **Statecharts** to formally model and implement the Responder UI logic. |

## 2. Testing Pillars: Implementation Detail

### 2.1 Static Analysis (Contract Enforcement)

* **What**: Utilizing **Zod** (Frontend) and **Lombok/Bean Validation** [Backend].
* **Why**: To mitigate the risk of "Contract Drift" across the microservice ecosystem.
* **Impact**: Strict schema enforcement at every entry point prevents malformed data from causing cascading service failures.

### 2.2 Automated Unit Testing (Domain Logic)

* **What**: Achieving a minimum of **50% line coverage** using JUnit 5 and Vitest.
* **Why**: To verify the internal correctness of business rules—such as resource allocation—without the overhead of network calls.
* **Refinement**: This addresses Q1 feedback where basic quality standards were met but coverage was insufficient.

### 2.3 Architectural Fitness Functions (ArchUnit)

* **What**: Automated tests verifying package dependencies, layer access, and service boundaries.
* **Why**: To prevent architectural decay and ensure that independent units (microservices) only communicate through well-defined interfaces.
* **Design Goal**: This specifically addresses the risk of "premature separation" identified in Q1 by regaining control over inter-service communication patterns.

### 2.4 Integration & Property-Based Testing (PBT)

* **What**: **TestContainers** for service environments and **jqwik** for randomized property validation.
* **Why**: Integration tests catch bugs that exist in the "space between services," such as the unauthorized SSE connections found in Q1.
* **Benefit**: Property-based tests find edge cases in high-risk logic—such as message persistence and ordering—that traditional example tests miss.

### 2.5 Performance Testing (Manual JMeter)

* **What**: Manual execution of **Apache JMeter** scripts for performance validation.
* **Why**: To uphold the **Reliability** and **Scalability** attributes under controlled test conditions.
* **Execution**: Performance tests remain manual due to infrastructure requirements (authentication, service orchestration) that are impractical to automate in CI.
* **Success Criteria**: P95 latency ≤ 500ms and 0% error rate for critical flows like "Crisis Update" submission (US10).

## 3. Formal Modeling & Quality Gates

### 3.1 UI Statecharts

* **What**: Modeling the **US10 Responder Crisis Update flow**.
* **Why**: To reduce the risk of "Impossible UI States".
* **Master Objective**: Statecharts mathematically prove that a user can only perform actions—like submitting a standardized update—when the system is in the correct state.

### 3.2 CI/CD Quality Gates

Our pipeline acts as a non-negotiable gatekeeper for production-readiness:

1. **Static Stage**: Prevents syntax and type violations (Lint/TSC).
2. **Logic + Fitness Stage**: Runs unit tests (> 50% coverage) and ArchUnit in the same pipeline stage to keep execution fast while preventing regressions and architectural drift.
3. **Integrity Stage**: Prevents service-to-service failures [Integration/PBT].

**Note**: Performance testing (JMeter) is conducted manually due to infrastructure complexity.

## 4. Manual Acceptance

* **What**: Final demo validation with the customer.
* **Why**: While automation proves we "built the system right" (verification), manual validation ensures we "built the right system" (validation) for the responder.
* **Q1 Refinement**: Focuses on maintaining the professional look and feel praised in the initial release.
