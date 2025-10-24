# ADR: Notification Workflow Analysis

## Status
Proposed

## Context

The current notification workflow in the system is as follows:

### Shared Event Contracts
To ensure consistency and type safety across services, the system uses a shared module (`event-common`) that defines common event classes (e.g., `IncidentEvent`). This module is included as a dependency in both event-producing and event-consuming services. By sharing event definitions, all services use the same contract for event structure, reducing integration errors and simplifying maintenance.

1. **Notification Origination**: Notifications are generated in the service responsible for handling events (e.g., `incident-service`).
2. **Reporting via Kafka**: These notifications are published to a Kafka topic, serving as the message broker for asynchronous communication between services.
3. **Distribution by Notification Service**: The `notification-service` subscribes to the relevant Kafka topic(s), consumes the event messages, and processes them as notifications.
4. **Frontend Delivery via SSE**: The frontend application subscribes to notifications from the `notification-service` using Server-Sent Events (SSE), enabling real-time delivery of notifications to users.

## Decision
- The system uses Kafka as the backbone for decoupled, asynchronous event-driven communication between microservices.
- The `notification-service` acts as a dedicated component for aggregating, processing, and distributing notifications.
- SSE is used for pushing notifications to the frontend, providing a simple and efficient mechanism for real-time updates.

## Consequences
- **Scalability**: Kafka enables horizontal scaling and reliable delivery of notifications between services.
- **Decoupling**: Event producers (e.g., event/incident services) and consumers (notification service) are decoupled, allowing independent evolution and deployment.
- **Real-time UX**: SSE provides a lightweight, browser-native way to deliver real-time notifications to users.
- **Extensibility**: Additional consumers or notification channels (e.g., email, SMS) can be added by subscribing to the Kafka topic.
- **Potential Drawbacks**: SSE is unidirectional and may not be suitable for all use cases (e.g., mobile clients, bidirectional communication). Kafka introduces operational complexity.

## Alternatives Considered
- WebSockets for frontend delivery (more complex, supports bidirectional communication).
- Direct REST polling (less real-time, higher latency, more load on backend).

## References
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
