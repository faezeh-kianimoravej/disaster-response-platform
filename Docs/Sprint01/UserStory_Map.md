**User Story Map -- Disaster Response System**

**Backbone (High-level Activities)**

1.  **Incident Report**

2.  **Review by Safety Region**

3.  **Assignment to Gemeente**

4.  **Dispatch to Emergency Teams**

5.  **Monitoring & Alerts**

**1. Incident Report**

- As a **Citizen / First Responder**, I can report an incident with:

  - Type of incident

  - Location

  - Time

  - Short description

- The incident is submitted to the **System**.

**2. Review by Safety Region**

- As the **Safety Region**, I receive all new incident reports.

- I can **review and validate** reports to ensure correctness and
  relevance.

- I decide which **Gemeente** is responsible.

**3. Assignment to Gemeente**

- The validated incident is forwarded to the responsible **Gemeente**.

- As the **Gemeente**, I can:

  - Add details about the incident

  - Prioritize the incident

  - Decide which **Emergency Teams** should be informed

**4. Dispatch to Emergency Teams**

- As the **Gemeente**, I notify the appropriate **Emergency Teams**.

- As **Emergency Teams**, we can:

  - See the incident details in our dashboard

  - Update our status (on route, active, resolved)

**5. Monitoring & Alerts**

- The **System Dashboard** provides real-time monitoring for:

  - Gemeente

  - Safety Region

  - Emergency Teams

- As the **Public**, I can receive relevant alerts:

  - Road closures

  - Evacuation instructions

  - Safety warnings

| Backbone (Activity)             | User Story                                                                 |
|--------------------------------|---------------------------------------------------------------------------|
| **Incident Report**             | As a Citizen / First Responder, I can report an incident with:<br>- Type<br>- Location<br>- Time<br>- Short description |
| **Incident Report**             | The incident is submitted to the System.                                   |
| **Review by Safety Region**     | As the Safety Region, I receive all new incident reports.                  |
| **Review by Safety Region**     | I can review and validate the report to ensure correctness and relevance. |
| **Review by Safety Region**     | I decide which Gemeente is responsible.                                    |
| **Assignment to Gemeente**      | The validated incident is forwarded to the responsible Gemeente.          |
| **Assignment to Gemeente**      | As the Gemeente, I can add details about the incident.                     |
| **Assignment to Gemeente**      | Prioritize the incident.                                                  |
| **Assignment to Gemeente**      | Decide which Emergency Teams should be informed.                          |
| **Dispatch to Emergency Teams** | As the Gemeente, I notify the appropriate Emergency Teams.                |
| **Dispatch to Emergency Teams** | As Emergency Teams, I can see incident details in the dashboard.          |
| **Dispatch to Emergency Teams** | Update status (on route, active, resolved).                               |
| **Monitoring & Alerts**         | Dashboard provides real-time monitoring for:<br>- Gemeente<br>- Safety Region<br>- Emergency Teams |
| **Monitoring & Alerts**         | As the Public, I can receive alerts:<br>- Road closures<br>- Evacuation instructions<br>- Safety warnings |

## User Story Map Diagram

![User Story Map Diagram](docs/Sprint01/UserStoryMap.png)

*Figure: User Story Map diagram created in Egon.*
