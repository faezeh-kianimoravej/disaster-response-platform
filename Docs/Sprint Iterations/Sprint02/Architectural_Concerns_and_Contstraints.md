## Architectural Constraints
| ID    | Constraint                 | Details / Implications                                                             |
| ----- | -------------------------- | ---------------------------------------------------------------------------------- |
|       | _Regulatory & Legal_       |                                                                                    |
| CON-1 | Data governance            | Must comply with **GDPR (or equivalent)** for personal and location data.          |
| CON-2 | Security standards         | Must follow government cybersecurity frameworks (e.g., ISO 27001, NIST).           |
| CON-3 | Emergency comms compliance | Adherence to national emergency communication requirements.                        |
|       | _Operational_              |                                                                                    |
| CON-4 | Crisis-mode resilience     | Must withstand sudden traffic spikes during disasters (earthquakes, floods, etc.). |
| CON-5 | NGO/volunteer integration  | Role management for citizens, responders, NGOs and Authorities.                    |
| CON-6 | Legacy system integration  | Must integrate with **existing emergency numbers (e.g., 112)** and systems.        |
|       | _Resource_                 |                                                                                    |
| CON-7 | Stakeholder alignment      | Collaboration needed across government, responders, and NGOs.                      |

## Architectural Concerns

| ID     | Concern                         | Details / Implications                                                                       |
| ------ | ------------------------------- | -------------------------------------------------------------------------------------------- |
|        | _Performance & Scalability_     |                                                                                              |
| CRN-1  | Timely alert delivery           | Alerts must be delivered within **60s** of issuance; requires real-time push infrastructure. |
| CRN-2  | High user load                  | Must handle **100k+ concurrent users** with average latency **< 3s** during crisis surges.   |
|        | _Availability & Reliability_    |                                                                                              |
| CRN-3  | System uptime                   | **99.95% availability** with offline fallback (e.g., cached data for citizens).              |
| CRN-4  | Data reliability                | Critical resource updates must succeed **99.9%** of the time without loss.                   |
| CRN-5  | Redundancy                      | Multi-region deployment and failover mechanisms to ensure continuity.                        |
|        | _Security & Privacy_            |                                                                                              |
| CRN-6  | Data protection                 | All citizen data encrypted **at rest and in transit**.                                       |
| CRN-7  | Unauthorized access             | **100% of unauthorized access attempts blocked and logged**.                                 |
|        | _Interoperability_              |                                                                                              |
| CRN-8  | Standards compliance            | Must support **CAP** and similar protocols for data exchange with national systems.          |
| CRN-9  | API-first design                | REST/JSON or XML APIs with consistent schemas for incident and alert data.                   |
|        | _Usability_                     |                                                                                              |
| CRN-10 | Authority usability             | Authorities must be able to allocate resources in **< 2 minutes** via dashboards.            |
| CRN-11 | Citizen usability               | Simple, multilingual UI with accessibility support (WCAG compliance).                        |
| CRN-12 | Platform consistency            | **100% feature parity** across iOS and Android apps; performance diff <**10%**.              |
|        | _Maintainability & Testability_ |                                                                                              |
| CRN-13 | Low-downtime updates            | Bug fixes/patches applied with **≤ 30s downtime** and zero data loss.                        |
| CRN-14 | Automated testing               | **95% test coverage** through automated pipelines.                                           |
| CRN-15 | CI/CD pipelines                 | Blue-green/canary deployments to minimize disruption.                                        |
