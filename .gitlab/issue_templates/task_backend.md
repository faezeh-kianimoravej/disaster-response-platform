# Task: BE - <short title>

## Summary

Describe the backend capability to implement in plain language.

Example: "Add deployment API and persistence for storing deployments and assigned response units."

## Scope / Work items

- Entities / Models to add or change (fields and types)
  - `Deployment` { id, incidentId, status, createdBy, createdAt }
  - `DeploymentUnit` { id, deploymentId, responseUnitId, assignedAt }
- Database changes / migrations required (describe DDL or migration steps)
- New or changed API endpoints
  - `POST /api/deployments` — create deployment (payload example)
  - `GET /api/deployments/:id` — retrieve deployment (response example)
  - `PUT /api/deployments/:id/finalize` — finalize and send deployment
- Data validation / DTOs / schemas

## Auth / Permissions

- Required roles/permissions for endpoints (e.g., `ROLE_COORDINATOR`)

## Implementation notes

- Service layer changes
- Repository/DAO changes
- Transactions and consistency considerations
- Eventing/notifications to trigger (if applicable)

