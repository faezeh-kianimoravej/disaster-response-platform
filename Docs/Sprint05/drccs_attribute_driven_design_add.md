# Attribute-Driven Design (ADD) for DRCCS

## Document purpose
This document captures a single pass of Attribute-Driven Design (ADD) for the Disaster Response Coordination & Citizen Communication System (DRCCS). It records the design rationale, selected architectural modules, allocation of responsibilities, important tactics and patterns, and validation/fitness checks tied to the prioritized quality-attribute scenarios provided.

---

## 1. Architectural drivers (prioritized)
1. **Timely alert delivery (Performance / Real-time)** — deliver alerts to citizens within **60s**; large-scale push during crises.
2. **High traffic resilience (Scalability / Reliability / Availability)** — support 100k+ concurrent users, 99.95% uptime, multi-region failover.
3. **Security & Privacy (GDPR, encryption, RBAC)** — protect personal & location data at rest and in transit; auditability.
4. **Interoperability (Standards / CAP / OASIS)** — exchange incident data with national systems and legacy emergency numbers (112).
5. **Usability & Fast decision making** — authoritative dashboards enabling resource allocation in < 2 minutes; citizen UX accessible, multilingual, WCAG.
6. **Maintainability & Testability** — automated pipelines, blue-green deployments, 95% test coverage.
7. **Offline / limited connectivity support** — mobile cached fallback behavior.

---

## 2. Key scenarios used in ADD
From the supplied list, four scenarios are selected as drivers for decomposition:
- **S1 (Alert broadcast)**: Citizen subscribes; mobile app must receive critical alert within 60s. (Performance)
- **S2 (Cached response)**: Citizen with limited connectivity requests nearest shelter; app must return cached data ≤ 10s. (Availability)
- **S3 (Mass updates)**: 1000+ responders send resource updates; updates must be stored & visible with 99.9% success. (Reliability / Scalability)
- **S4 (CAP exchange)**: Authority shares incident data with national CAP endpoint; 100% schema compliance. (Interoperability)

---

## 3. Top-level conceptual architecture
**High-level modules / components** (logical view):
1. **Edge / Ingress Layer**
   - API Gateway (REST/JSON + XML support), WebSockets gateway, Push gateway (APNs/FCM), SMS gateway interface.
   - Responsibilities: authentication, throttling, routing, protocol translation, initial rate-limiting.
2. **Realtime Messaging / Alerting Layer**
   - Message Bus / Stream Processor (e.g., pub/sub cluster), Notification Service, Alert Rules Engine, Push Workers.
   - Responsibilities: accept alert issuance, enrich, prioritize, fan-out to channels (push/SMS/websocket), ensure delivery SLAs.
3. **Application Services Layer**
   - Incident Management Service (CAP/OASIS adapter), Resource Management Service, Responder Portal Service, Citizen Services API, Reporting & Audit Service.
   - Responsibilities: domain logic, validation, business workflows, RBAC enforcement.
4. **Data & Persistence Layer**
   - Time-series store for telemetry (sensors), Document store for incidents & reports, Relational DB for user/accounts/roles, Cache & CDN for offline assets, Geo-indexed datastore for shelters/POIs.
   - Responsibilities: durable storage, geo-queries, caching for offline responses.
5. **Integration & Interop Layer**
   - CAP/OASIS Adapter, Legacy Gateway (112/SMS/telephony), Weather & Sensor Feed Adapters, GIS/Tiles integration.
6. **Client Layer**
   - Mobile apps (Android), Progressive Web App (PWA), Responder web portal, Authority dashboards, SMS/USSD fallback.
7. **Operational & Platform Services**
   - Identity/Access (OAuth2 + RBAC), Key Management (Vault), Logging & Audit, Monitoring & Alerting, CI/CD pipelines, Chaos & Load test harness.

---

## 4. Allocation of responsibilities & how drivers map to components
- **Low-latency alert delivery** → *Notification Service* + *Message Bus* + *Push Workers* + *Edge Push gateway*. Use push-first design with WebSocket fallback and SMS fallback. Near-user caching via CDN/edge for static guidance assets.
- **High concurrency** → horizontally scalable *API Gateway*, stateless app services, sharded message bus, autoscaling push workers, multi-region active-active deployment with geo-routing.
- **Availability & offline behavior** → client-side caches (PWA + mobile local DB), TTLed shelter datasets synchronized frequently; server-side cache and read replicas for fast geo-queries.
- **Security & GDPR** → encryption in transit (TLS1.3) and at rest (KMS-backed), per-tenant/data isolation, fine-grained RBAC enforced in App Services, consent records and data retention flows.
- **Interoperability** → *CAP/OASIS Adapter* to validate & transform messages; an API conformance gateway to run schema validation and generate standard acknowledgements.
- **Maintainability** → containerized microservices, clear API contracts, automated tests for contracts and performance, blue-green releases.

---

## 5. Design decisions & architectural tactics
### Real-time/Performance tactics
- **Push-first delivery**: use native push (APNs/FCM) for reach and WebSocket for live sessions. Fallback to SMS for subscribers without data.
- **Priority queuing & QoS**: alerts are prioritized; emergency-critical take precedence; separate queues for emergency vs non-emergency.
- **Batch fan-out with rate-limiting windows**: spread fan-out across worker pool to avoid provider rate limits.
- **Edge filtering**: pre-filter messages at API gateway to reject malformed or malicious broadcasts.

### Scalability & Reliability tactics
- **Stateless microservices** behind an API gateway for horizontal scale.
- **Event-driven backbone** (durable message bus like Kafka or cloud pub/sub) for decoupling and replayability.
- **Backpressure & circuit breakers** to protect downstream systems.
- **Multi-region active/active architecture** with eventual cross-region consistency for non-critical data and strong consistency for critical commands (using leader-election only when needed).

### Availability / Resilience tactics
- **Client resiliency**: mobile apps should have local DB (SQLite/Realm) + cached shelter/route assets; offline mode presents last-known data.
- **Failover strategies**: multi-region DNS + health-based routing; automated failover to secondary regions.
- **Graceful degradation**: degrade non-essential features during crisis (analytics, heavy maps tiles) to prioritize alerts & resource updates.

### Security & Privacy tactics
- **Encryption**: TLS everywhere + server-side encryption with KMS (per-region) and envelope encryption for sensitive PII.
- **RBAC & least privilege**: roles modeled as Policy objects; admin console enforces separation of duties.
- **Audit & WORM logs**: immutable audit logs for communications and decisions, stored with retention rules.
- **Anonymization & data minimization**: store precise location only when necessary; use truncated/coarsened coordinates for non-critical flows; store deletion/retention flows for GDPR.

### Interop tactics
- **Schema validation layer**: enforce CAP/OASIS schemas at the gateway; provide machine-readable error messages.
- **Adapter pattern** for legacy systems (112, SMS centres) encapsulating protocol quirks.

---

## 6. Candidate module breakdown (logical -> implementation suggestions)
1. **API Gateway** — Kong/Envoy/Managed API GW
2. **Auth Service** — OAuth2 + OpenID Connect provider, integrate with government identity when available
3. **Alert Engine** — microservice orchestrating alert creation, priority assignment, and persistence
4. **Notification Workers** — horizontally scaled workers that deliver to APNs/FCM, WebSockets, SMS
5. **Message Bus** — Kafka / cloud pubsub (durable topics: alerts, incidents, resource-updates)
6. **Incident Service** — event store (append-only) + materialized views for dashboards
7. **Resource Management Service** — relational DB with optimistic concurrency + event-sourcing for updates
8. **Geo Service** — geo-indexed read-optimized store (PostGIS / Elastic geo) for nearest-shelter queries
9. **CAP Adapter** — validation, transformation, and transmission to national endpoints
10. **Responder Portal & Dashboard** — React/Typescript apps with websockets for live updates
11. **Mobile & PWA** — offline storage (IndexedDB/SQLite), background sync, push registration
12. **Monitoring & Observability** — metrics (Prometheus), tracing (OpenTelemetry), logs (ELK/managed), SLO dashboards
13. **CI/CD & Test Harness** — pipelines that run static tests, contract tests, chaos runs, load tests (Locust/JMeter)

---

## 7. Iterative ADD step (example — mapping S1: Alert broadcast)
**Step A — Identify scenario specifics**: issuance by Authority → system must fan-out to subscription set and ensure delivery ≤ 60s.

**Step B — Choose architectural elements**:
- API Gateway receives alert request (auth + validation).
- Alert Engine writes to durable topic `alerts` in Message Bus.
- Notification Workers subscribe to `alerts` topic, classify subscribers (push/websocket/SMS), enqueue to per-channel delivery queues.
- Push Workers use connection pools to APNs/FCM; WebSocket gateway broadcasts to active socket connections.
- Monitoring tracks per-alert latency from issuance → delivered; if delivery breaches thresholds escalate via fallback SMS.

**Step C — Tactics used**: durable messaging, prioritized queues, push-first fanout, connection pooling, circuit breakers on provider failures, fallback to SMS for unreachable devices.

**Step D — Fitness function & validation**: run automated end-to-end latency tests that simulate production subscriber counts. Pass when 99% of alerts delivered to device or shown in-app within 60s. Use load tools (JMeter / Locust) and synthetic mobile endpoints.

---

## 8. Non-functional architecture specifics & operations
- **SLA / SLO**: Alert delivery SLO: 99% of critical alerts delivered within 60s under defined load profile. Uptime SLO: 99.95% per region.
- **Data retention & GDPR**: configurable retention by data type; consent records tied to user profile; right-to-be-forgotten flows that purge or anonymize data across stores (documented and automated).
- **Secrets & KMS**: single source of truth for secrets (Vault) with region-aware key policies.
- **Backup & Recovery**: automated cross-region backups, RPO tuned for critical data (near-zero for alerts metadata), RTO defined per component.
- **Testing & Validation**: contract tests for API & CAP/OASIS; performance tests simulating crisis surges; chaos runs for network partition & region failover; penetration tests for security.

---

## 9. Risks, trade-offs & mitigations
- **Risk**: Provider push limits (APNs/FCM) may slow delivery at massive scale. *Mitigation*: staggered fan-out, provider sharding, SMS fallback for top-priority alerts.
- **Risk**: Strong consistency across regions introduces latency. *Mitigation*: use eventual consistency for non-critical data; keep critical commands to a tightly coordinated path.
- **Trade-off**: Full end-to-end encryption of messages to devices vs. server-side processing (e.g., routing / priority): implement envelope encryption for PII and keep alert metadata readable for routing while encrypting sensitive payloads.

---

## 10. Validation & acceptance tests mapped to scenarios
- **S1**: End-to-end latency tests (Locust/JMeter) + synthetic mobile endpoints — pass if 99% < 60s under target concurrency.
- **S2**: Simulate network cuts; verify cached shelter query returns within 10s and provides emergency number. Chaos tests.
- **S3**: Load test Resource Management Service with 1000+ concurrent responder writes; verify 99.9% success and DB integrity checks.
- **S4**: API conformance tests for CAP/OASIS using schema validators and contract tests.

---

## 11. Next steps & recommended follow-ups
1. **Define concrete non-functional test profiles**: exact user counts, request distributions, push-sizes per alert.
2. **Prototype push-worker pool & measure provider throughput limits** to validate fan-out strategy.
3. **Detail data model** for incident/event store and audit logs (append-only event store recommended).
4. **Run a security review** with red-team + privacy impact assessment (DPIA) for GDPR.
5. **Run a trimmed pilot** with a single region + a cooperating authority to validate end-to-end flows.

---

## Appendix A — Quick mapping of requirements to components
- FR-1 (real-time chat/voice): Responder Portal (WS + VoIP gateway) + Media servers (SIP / WebRTC)
- FR-2 (broadcast alerts): Alert Engine + Notification Workers + SMS/Gateway
- FR-3 (citizen reports): Citizen Services API + Document store + Media preprocessing pipeline
- FR-4 (maps): Geo Service + tile CDN + sensor feed adapters
- FR-5 (dashboard): Incident Service + Materialized views + WebSocket feeds
- FR-6 (resource tracking): Resource Management Service + optimistic concurrency + event stream
- FR-7..9 (citizen services): Mobile + PWA + offline caches + guidance assets
- FR-10..12 (admin & integration): Auth service, Audit service, Adapters


---

