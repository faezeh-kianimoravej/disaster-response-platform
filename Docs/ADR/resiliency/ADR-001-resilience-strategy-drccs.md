# ADR-001: Resilience Strategy for DRCCS

## Status
Accepted

## Context

The Disaster Response Coordination and Communication System (DRCCS) is a distributed, microservices-based system designed to operate under highly dynamic, failure-prone, and time-critical conditions. Partial failures, load surges, and infrastructure degradation are expected operational conditions rather than exceptional cases.

The findings of the Systematic Literature Review (SLR) conducted as part of the Individual Assignment show that resilience in microservices is not achieved through isolated mechanisms, but through coordinated architectural and runtime decisions. In particular:

- Communication style fundamentally shapes failure propagation behavior.
- Synchronous systems primarily fail by blocking and cascading.
- Asynchronous systems primarily fail by queueing and overload.
- Different failure modes require different resilience strategies.
- Resilience mechanisms introduce unavoidable trade-offs in latency, complexity, and operational cost.

DRCCS contains both:
- Time-critical, consistency-sensitive operations (e.g., incident queries, deployment orchestration).
- Coordination and notification workflows that tolerate delayed or eventual processing.

## Decision

DRCCS adopts a system-level, failure-mode–aware, and communication-style–aware resilience strategy consisting of the following integrated decisions:

### 1. Hybrid Communication Model

- Synchronous request–response communication is used for critical orchestration paths requiring immediate responses and stronger consistency guarantees.
- Asynchronous, event-driven communication (Kafka) is used for cross-service coordination, notifications, and state propagation.

### 2. Protection of Critical Synchronous Orchestration Paths

For critical synchronous paths (e.g., API Gateway → Incident-Service → Deployment-Service → Resource-Service):

- Explicit end-to-end timeout budgets are enforced across call chains.
- Circuit breakers are applied at API Gateway and Feign client boundaries.
- Unbounded retries are disabled; if retries are used, they are strictly limited and combined with exponential backoff and circuit breakers.
- Synchronous endpoints are classified into critical and non-critical, with stricter isolation policies for mission-critical paths.

### 3. Flow Regulation and Backlog Control in Asynchronous Pipelines

For Kafka-based asynchronous pipelines:

- Consumer lag and queue depth are treated as first-class operational metrics.
- Backpressure or admission control is applied at message producers to prevent uncontrolled backlog growth.
- Priority handling is introduced for critical event types.
- Load-aware and reactive consumption strategies are used to adapt processing rates to available capacity.

### 4. Failure-Mode–Aware Resilience Mapping

Resilience mechanisms are explicitly aligned with dominant failure modes:

- Blocking and slow downstream services → Timeouts and circuit breakers.
- Retry amplification and retry storms → Strict retry limits, exponential backoff, and circuit breakers.
- Message backlog accumulation → Backpressure, flow regulation, and queue-aware load control.
- Resource contention and cross-service interference → Bulkheads and rate limiting.

### 5. Dependency-Aware Architecture Hardening

- An explicit service dependency graph is maintained.
- Critical dependency paths and high fan-in/fan-out services are identified.
- Synchronous call chains are kept short and cyclic dependencies are avoided.
- Stricter timeout and circuit breaker policies are applied to services on critical dependency paths, especially Incident-Service and Deployment-Service.

### 6. Resilience as a System-Level and Continuously Validated Practice

- Chaos engineering experiments (service crashes, latency injection, broker slowdowns) are regularly performed.
- Overload and surge tests reflecting realistic disaster scenarios are executed.
- In addition to availability, tail latency, retry rates, queue backlog, and circuit breaker states are continuously monitored.
- Observations from these experiments are used to iteratively refine timeout budgets and flow-control policies.

## Consequences

### Positive

- Improved availability and fault containment under partial failures and extreme load.
- Clear alignment between communication style, failure modes, and resilience mechanisms.
- Graceful degradation instead of abrupt system-wide collapse.
- Architecture supports resilience at the system level instead of relying on ad-hoc, per-service configurations.

### Negative / Trade-offs

- Increased architectural and operational complexity.
- Additional latency overhead due to timeouts, circuit breakers, and flow-control mechanisms.
- Higher operational and testing cost due to continuous validation and chaos engineering.
- Weaker consistency guarantees in asynchronous parts of the system and more complex state management.

## Alternatives Considered

- Uniform, per-service application of generic resilience patterns (rejected: shown by SLR to be ineffective and potentially harmful).
- Fully synchronous architecture (rejected: high risk of blocking cascades and catastrophic failure propagation).
- Fully asynchronous architecture (rejected: excessive complexity and weaker consistency guarantees for critical operations).

## Rationale

This decision is directly based on the synthesized evidence from the Systematic Literature Review, which shows that:

- Resilience is a system-level optimization problem, not a collection of isolated best practices.
- Communication style is a primary determinant of failure behavior and resilience strategy.
- Effective resilience requires alignment between architecture, dominant failure modes, and operational controls.
- Trade-offs introduced by resilience mechanisms must be explicitly accepted and managed rather than implicitly ignored.
