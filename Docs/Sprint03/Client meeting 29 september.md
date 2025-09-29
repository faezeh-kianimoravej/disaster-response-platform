# General
**Location:** Saxion

**Date:** 29 September 2025

**Time:** 11:30–12:30

# Participants
- Development team
	- Furqan Malik
	- Sepideh Qorbani
	- Faezeh Kianimoravej
	- Ben Vos
- Client
	- Ivo van Hurne

# Agenda
Agenda 
- Follow-up from last meeting
	- Presentation of the Impact Map (delayed deliverable from last week)
- Review of Deliverables for this week
	- Domain Stories and User Story Map for the first features
	- Prioritized Quality Attribute Scenarios and Fitness Functions
	- Identified Architectural Concerns and Constraints
- Client Feedback & Clarifications
	- Validation of Domain Stories
	- Feedback on User Story Map
	- Agreement on Quality Attribute priorities and Fitness Functions
	- Confirmation of Concerns and Constraints
- Questions from the Team
	1. Should citizens be able to register an incident directly in the system, 
or should all reports only come through 112?
	2. Are hospitals considered first responders or secondary responders? 
In large-scale disasters, are they expected to establish temporary 
camps near the disaster site?
	3. Do you expect us to use a relational database or a NoSQL database for 
this project?
	4. Are we allowed to use cloud services in the solution, or should the 
system only be deployed on-premise?

# Notes
**Impact map**
- Client expands scope to include keeping track of people during riots (Are we allowed to track people for this purpose? Is this scope creep? How can we keep track of people?)

**Domain stories**
- Expand options to register disasters in the system, there's more options than just 112 (Rangers, seismic institues etc.)
- Planning the incident in the system should be a continuous proces
- Not all new incidents require immediate response, use multiple priority levels
- System should include a functionality to manage the incident (GRIP levels etc.)
- System should have a training mode for all coordinators and responders to train

**User story map**
- Validating and categorizing need more refinement/ smaller stories.
- No use talking about user story map if we're not building it yet.

**Quality Attributes**
- Make sure to write down that the tools are options, not yet implemented solutions/ tests
- Scenarion #2: Be careful about which data you cache, be sure not to send people to locations that were previously safe
- Scheduled maintance time shouldn't be downtime, increase the 99.95% to 99.99%
- Update #3 to be 100%
- Rewrite #4 to be about starting the system from start
- Interoperability should probably about exchanging information without problems and connecting without problems. A standard/ protocol is a solutions not a scenario.

**Questions**
- Look into GGD GHOR instead of hospitals. Take their perspective into account as well

**Sprint report**
- Be sure to record task of documentation etc.

# Actions
- Refine the user story map. Split up the stories into smaller parts. Start with first objectives first, no need to refine all stories in one go.