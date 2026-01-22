# ADR: Event-Driven Notification Workflow

**Status:** Accepted  
**Date:** 2025-11-15  
**Sprint:** 07  
**Related ADRs:** ADR_REST_Endpoint_Standards, ADR_Organization_Service_Consolidation

## Context

The system needs to deliver real-time notifications to frontend clients when events occur (e.g., incidents created, chat messages sent). Multiple services generate events that need to be aggregated and pushed to clients with low latency. This requires a decoupled, asynchronous architecture.

Key requirements:

- Real-time delivery to frontend
- Decoupling between event producers and consumers
- Type-safe event contracts across services
- Extensibility for future notification channels

## Decision

The system implements an **event-driven notification workflow** using:

1. **Shared Event Contracts** (`event-common` module): All services share common event classes
2. **Kafka** as the event backbone for decoupled, asynchronous communication
3. **Notification Service** as a dedicated consumer and aggregator
4. **Server-Sent Events (SSE)** for pushing notifications to the frontend

## Workflow

```text
Event Producer (incident-service)
  → Publish to Kafka topic
  → Notification Service subscribes
  → Processes and caches notifications
  → Frontend subscribes via SSE
  → Real-time delivery
```

## Rationale

- **Decoupling**: Event producers don't need to know about notification delivery
- **Scalability**: Kafka enables horizontal scaling with topic partitions
- **Type Safety**: Shared event DTOs reduce integration errors
- **Real-time UX**: SSE is lightweight and browser-native (no WebSocket complexity)
- **Extensibility**: Additional consumers (email, SMS, push) can subscribe to same topics

## Consequences

### Positive

- Services are decoupled; can deploy independently
- Kafka provides reliable, ordered message delivery
- SSE is simpler than WebSockets for one-way server→client messaging
- Easy to add notification channels (email, SMS, push) without changing core logic
- Type-safe events via shared module

### Negative / Trade-offs

- **SSE is unidirectional**: Cannot send client→server messages (use REST for commands)
- **Not mobile-friendly**: Mobile apps cannot use SSE (need push notifications, WebSocket fallback)
- **Operational complexity**: Kafka requires deployment, monitoring, scaling
- **Message ordering**: Within a partition only (for multi-user notifications, ordering not guaranteed)

## Alternatives Considered

### WebSockets for Frontend Delivery

- **Pros**: Bidirectional communication, better mobile support
- **Cons**: More complex client/server protocol, higher resource usage
- **Why not chosen**: SSE sufficient for one-way notifications; WebSocket adds unnecessary complexity

### Direct REST Polling

- **Pros**: Simple, no special protocol
- **Cons**: High latency, chatty API, wasted requests
- **Why not chosen**: Real-time delivery is a core requirement

## Implementation Details

### Event Producers

Services publish events to Kafka after creating domain objects:

```java
@Autowired
private KafkaTemplate<String, IncidentEvent> kafkaTemplate;

void publishIncidentCreated(Incident incident) {
  kafkaTemplate.send("incidents.events", incident.toEvent());
}
```

### Event Consumer (Notification Service)

Subscribes to Kafka topics and pushes to connected SSE clients:

```java
@KafkaListener(topics = "incidents.events", groupId = "notification-service")
void handleIncidentEvent(IncidentEvent event) {
  // Process and broadcast to SSE subscribers
}
```

### Frontend SSE Subscription

```javascript
const eventSource = new EventSource("/api/notifications/subscribe");
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  displayNotification(notification);
};
```

### Event Common Module

Shared DTOs ensure type safety:

- `IncidentEvent`
- `ChatMessageEvent`
- `UserStatusEvent`
- etc.

## Validation / Testing

Property-based tests validate:

- **Message ordering**: Events from same producer maintain order
- **SSE connection lifecycle**: Auth on connect, graceful disconnect
- **Payload schema**: All events match event-common DTOs
- **Notification delivery**: Published event → subscribed client within timeout
- **Error handling**: Kafka failure does not crash service; reconnection works

See `ADR_Controller_Integration_Testing` for test patterns.

## References

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- `event-common` module in backend-app
- `notification-service` implementation

---

**Originally Proposed By:** Backend Architecture Team  
**Last Updated:** 2025-12-12
