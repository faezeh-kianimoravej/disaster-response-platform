# Client Meeting — Minutes  
**Disaster Response Project (Sprint 11)**

**Location:** Saxion  
**Date:** 8 December 2025  
**Time:** 13:15–13:45  

## Participants
- Sepideh Qorbani  
- Faezeh Kianimoravej  
- Furqan Malik  
- Ben Vos  

---

## Agenda
1. Follow-up from previous meeting  
   - Authentication integration (Keycloak-based frontend–backend authentication)

2. Review of deliverables for this sprint  
   - Incident Chat functionality  
   - Authentication (completed Keycloak integration)  
   - Performance testing for incident registration  

3. Client feedback and clarifications  

---

## Minutes

### 1. Follow-up from previous meeting
The team confirmed that authentication integration was planned for this sprint. The Keycloak-based authentication between frontend and backend has been completed and was demonstrated during the meeting.

### 2. Review of deliverables for this sprint

**Incident Chat Functionality**  
The team presented the implementation of the incident chat feature. This included the backend chatroom creation and the frontend chat interface to support real-time communication.

**Authentication**  
The completed Keycloak integration securing frontend-backend communication was reviewed. The client acknowledged the progress made in this area.

**Performance Testing – Incident Registration**  
An overview of the performed performance tests for incident registration was provided. The scope of the tests and observed results were briefly discussed.

### 3. Client feedback and clarifications
The client advised the team to briefly revisit the domain model and reconsider the defined sub-domains. The goal is to assess whether any domains could be combined, but only if doing so genuinely improves clarity. Unnecessary restructuring should be avoided.

The client stressed that, at this stage of the project, design should be prioritized over implementation. Even if development speed slows down, refining and correcting the design is more important than pushing features forward too quickly.

The team was asked to clearly write and document the design for the Responder App. This documentation should include a comparison of different design approaches, outlining their pros and cons, to support a well-reasoned design decision.

Regarding the chat feature, the client clarified that the current scope is limited to tracking and location-based messaging. Additional features such as voice messages or picture sharing are not required at this time.
