# User Stories Acceptance Criteria in Gherkin

## US01: Resource Reporting

**As a** Responder  
**I want to** report available resources for incident response  
**So that** resource allocation can be managed

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Resource Reporting

  Scenario: Responder submits resource availability
    Given I am logged in as a responder
    When I submit my available resources
    Then my reported resources should be recorded

  Scenario: View reported resources
    Given resources have been reported by responders
    When I view the resource tracking page
    Then I should see all reported resources and their status
```

---

## US02: Receive Incidents from Citizens

**As a** Citizen  
**I want to** report incidents via 112  
**So that** incidents are registered and tracked efficiently

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Incident Reporting from Citizens

  Scenario: Citizen reports an incident via 112
    Given I am a citizen
    When I report an incident via 112
    Then the incident data should be logged

  Scenario: Incident is visible to authorized users
    Given an incident has been reported by a citizen
    When an authorized user views the incident list
    Then the new incident should be visible
```

---


## US04: Incident Prioritization

**As a** Authority  
**I want to** assign priority levels to incidents  
**So that** the most urgent incidents are handled first

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Incident Prioritization

  Scenario: Authority assigns priority to an incident
    Given an incident is registered
    When I assign a priority level to the incident
    Then the incident should display its assigned priority

  Scenario: Authority views incidents sorted by priority
    Given multiple incidents with assigned priorities
    When I view the incident list
    Then incidents should be sorted by priority level

  Scenario: Authority filters incidents by title, GRIP, Priority or Time
    Given multiple incidents are displayed
    When I select a filter for the incidents
    Then only filtered incidents should be shown
```

---

## US05: Notify Authority of New Incidents

**As a** Authority  
**I want to** be alerted about new incidents, including urgency details  
**So that** I can respond quickly to new incidents

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Authority Notification for New Incidents

  Scenario: Authority receives notification with urgency information
    Given a new incident is reported
    When I am the authority responsible for incident response
    Then I should receive a notification including urgency details

  Scenario: Authority clicks incident notification
    Given an incident notification
    When I click on the notification
    Then I should navigate to the incident details
```

---

## US06: Resource Assignment

**As a** Authority  
**I want to** assign resources to specific incidents  
**So that** incidents are managed with appropriate resources

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Resource Assignment

  Scenario: Authority allocates resources to incidents
    Given an incident requires resources
    When I assign resources to the incident
    Then the assignment should be recorded

  Scenario: Authority views assigned resources
    Given resources have been assigned to incidents
    When I view the incident details
    Then the assigned resources should be visible and tracked
```

---

## US07: Incident Chatroom Creation

**As a** Responder  
**I want to** collaborate in a shared chatroom for each incident  
**So that** responders can collaborate effectively during incident response

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Incident Chatroom Creation

  Scenario: Chatroom is created and linked to incident
    Given a new incident is created
    When I am assigned as a responder to the incident
    Then I should be able to join a chatroom linked to the incident

  Scenario: Only assigned responders can join and communicate
    Given a chatroom exists for an incident
    When I am assigned to the incident
    Then I can join and communicate in the chatroom

    When I am not assigned to the incident
    Then I cannot join or communicate in the chatroom
```

---

## US35: CRUD User

**As a** system administrator
**I want to** create a new user in the system
**So that** the user can access the application with their own credentials and assigned permissions.

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Create New User

  Background:
    Given I am logged in as a user with the "Admin" role

  Scenario: Access Create User form
    When I navigate to the Create User page
    Then I should see a form with fields for First Name, Last Name, Email Address, Mobile Number, Password, and Role
    And I should see optional fields for Department, Region, and Municipality

  Scenario: Required fields validation
    When I submit the form with missing required fields
    Then I should see validation errors indicating which required fields are missing

  Scenario: Email and mobile number must be unique and valid
    When I enter an email address or mobile number that already exists
    And I submit the form
    Then I should see an error message indicating the email or mobile number is already in use

    When I enter an invalid email or mobile number format
    And I submit the form
    Then I should see an error message indicating the format is invalid

  Scenario: Successful user creation
    When I complete all required fields with valid and unique values
    And I submit the form
    Then I should see a confirmation message "User created successfully."

  Scenario: Error handling on failed creation
    Given I have filled in the form
    When user creation fails (for example, due to a duplicate email)
    Then I should see an appropriate error message
    And all previously entered form data should remain prefilled for correction

  Scenario: Security - Only Admin can access
    Given I am not logged in as an Admin
    When I try to access the Create User page
    Then I should be denied access
```

---

## US36: Deployment plan

**As a** Officer on Duty  
**I want to** assign manpower and resources based on the deployment order I received  
**So that** so that it's clear which people and resources are responding to an incident.

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Deployment plan

  Scenario: Officer on Duty receives deployment order
    Given a deployment order from a CaCo
    When the deployment relates to my department
    Then I should receive a notification about the new deployment

    Given a deployment notification comes in
    When I click on the notification
    Then I should see the deployment details relevant to my department

  Scenario: Officer on Duty defines response units
    Given a deployment order is opened
    When I look at response units
    Then I assign available people and resources to fill the response unit
```

---

## US38: Keycloak implemenation and integration

**As a** user
**I want to** make authenticated and authorized requests to the backend from the frontend
**So that** every single api request can be checked for authentication and authorization.

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Keycloak implemenation and integration

  Scenario: User request
    Given the frontend makes a request to the API gateway
    When the request is received
    Then authorization and authentication are checked
```

---

## US39: Create deployment

**As a** Calamity Coordinator
**I want to** deploy people and resource as response to an incident
**So that** an organized and managed response can be created.

### Acceptance Criteria (Gherkin)

```gherkin
Feature: Create deployment

  Scenario: Create deployment
    Given an active incident
    When the deployment page is open
    Then one or more available response units are shown

    Given a response unit
    When looking at the unit
    Then an explanation is available as a tooltip

    Given a response unit
    When the unit is available
    Then I can include it in a new deployment

    Given a deployment
    When I have one or more units included in the deployment
    Then I can finalize and sent the deployment

```

---