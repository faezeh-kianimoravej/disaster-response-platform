# Review Summary and Action Plan

## Code Implementation
- Multiple reviewers noted **very limited backend and frontend code** — often only one or two entity classes.
- **Missing or incomplete:**
  - Functional implementation of user stories.
  - Automated testing (unit + fitness functions).
  - CI/CD pipeline setup.
- Missing **auditable information** (like creation and update timestamps).
- Did not use **Lombok** or similar utilities to simplify constructors and code structure.

## Architectural Documentation
- **ADD document** is present but lacks:
  - Clear rationale for design decisions.
  - Explicit drivers, analysis, and iteration goals.
  - Detailed interface definitions between components.
- Only **one architectural design** is shown; no clear alternative designs were compared.
- **Quality attributes** are not prioritized in some reports.
- **Reviewers had to make assumptions** to answer tactics questions due to missing detail.

## Sprint Reporting
- **Meeting minutes and agendas** were missing or inconsistent in some sprints (especially Sprint 1 and 2).
- **Retrospective action items** weren’t always listed in reports.
- Some **cycle time metrics** and **scatter plots** were missing or incomplete (especially in early sprints).

## Technical Concerns
- While your architecture is **scalable**, there’s no detailed strategy for **concurrency, caching, or queue management**.
- Some reviewers mentioned that using **microservices on AWS** might be limited by permissions — but **Terraform** should solve this.

## Frontend & Visual Design
- Reviewers pointed out a **complete absence of mockups or frontend materials**.
- **Recommendation:** Use **Figma** or a similar tool to design visual interfaces before continuing backend development.

## Architecture Tactics (Performance Attribute Example)
Most reviewers focused on **Performance (timely alert delivery):**
- You support **bounded execution time** and **resource scaling**, but lack tactics for:
  - Managing or throttling work requests.
  - Limiting queues.
  - Explicit concurrency mechanisms.
  - Resource optimization or algorithm efficiency.

## Conclusion

### What We Did
- Acknowledged the lack of code and **already started coding**.
- Used **Lombok** and **auditing** for entities.
- Implemented **CI/CD for frontend**.
- Designed **frontend mockups** (Figma or similar).

### Planned To
- Review our **ADD** as per book definition.
- Record **retrospective actions** in every sprint report.
- Prepare **basic test scripts** (unit + fitness).

## Long-term Improvements
- **Prioritize** one or two quality attributes and show explicit design tactics for them.
- **Build a prototype** (even minimal) before week 9 to demonstrate progress.
- Ensure every sprint produces **visible, testable output**.
- Maintain **traceability** between goals, user stories, and design artifacts.
- Prepare to demonstrate the **connection between architecture and performance** (e.g., “How does our design achieve alert <60s?”).
