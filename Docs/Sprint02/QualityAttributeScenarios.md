# Quality Attribute Scenarios
## Main Goals
1. **Timely communication & alerts** → Performance, Availability, Reliability.
2. **Effective decision-making** → Usability, Performance, Scalability.
3. **Citizen safety & trust** → Security, Reliability, Availability.
4. **Future-proof growth** → Scalability, Maintainability, Interoperability, Portability.

## Prioritized Scenarios

| Priority | Environment             | Quality Attribute   | Source              | Stimulus                                  | Artifact                   | Response                                                   | Response Measure                      | Fitness Function                                               | Tools                                  |
|----------|-------------------------|--------------------|---------------------|-------------------------------------------|----------------------------|------------------------------------------------------------|---------------------------------------|----------------------------------------------------------------|---------------------------------------|
| 1        | Normal operation        | Performance        | Citizen             | Subscribes to emergency alerts            | Mobile App                 | Delivers critical alert to citizen                         | Delivered within 60s of issuance      | Automated end-to-end latency tests simulating alert broadcasts | JMeter, Locust                         |
| 2        | Limited data connection | Availability       | Citizen             | Requests nearest shelter location         | Mobile App                 | Provides result using cached data (last known shelter + emergency number) | 99.95% uptime, fallback response ≤ 10s | Chaos/failure injection to cut network + monitor fallback behavior | Chaos Monkey, Gremlin                  |
| 3        | High traffic            | Reliability        | Emergency responder | Sends resource status update (from 1000+ responders) | Resource Management Portal | Update stored & visible to authorities                     | 99.9% success rate without data loss  | Stress/load testing with integrity checks on stored updates    | Gatling, JMeter + DB consistency check |
| 4        | High traffic            | Interoperability   | Authority           | Shares incident data with national system (CAP/OASIS) | Data exchange API          | Data exchanged successfully                                | 100% compliance with CAP & OASIS       | API conformance testing + schema validation                    | Postman, SoapUI, Swagger validators    |
| 5        | Normal operation        | Security           | Citizen             | Provides location & personal data         | Citizen database           | Encrypts & stores data securely with RBAC enforced         | 100% encrypted at rest & in transit   | Static code scans + runtime encryption + role-based access verification | SonarQube, OWASP ZAP, Vault            |
