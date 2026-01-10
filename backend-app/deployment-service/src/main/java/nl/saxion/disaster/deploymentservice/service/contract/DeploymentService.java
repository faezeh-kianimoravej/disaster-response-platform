package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.client.IncidentBasicDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;

public interface DeploymentService {

    /**
     * Performs a *manual allocation* of a ResponseUnit to a DeploymentRequest.
     * Frontend sends:
     * - requestId           → ID of the DeploymentRequest being assigned
     * - assignedUnitId      → ResponseUnit selected by the operator
     * - assignedPersonnel   → list of personnel (slotId, userId, specialization)
     * - allocatedResources  → list of selected resources (resourceId, quantity, isPrimary)
     * - assignedBy          → ID of the operator performing the allocation
     * - notes               → optional remarks
     * Backend responsibilities:
     * - Load and validate the DeploymentRequest
     * - Load and validate the selected ResponseUnit (department + type + availability)
     * - Update ResponseUnit.currentPersonnel with the provided personnel list
     * - Update ResponseUnit.currentResources with the provided resource list
     * - Set the ResponseUnit status to DEPLOYED
     * - Create a Deployment snapshot from the updated ResponseUnit
     * - Set DeploymentRequest status to ASSIGNED and store audit data
     * Returns:
     * - DeploymentAssignResponseDTO containing:
     *   - updated DeploymentRequest information
     *   - the created Deployment summary
     *   - a descriptive status message
     * This method replaces the previous auto-allocation logic.
     *
     * @param dto manual allocation data coming from the frontend
     * @return response containing the created deployment and updated request status
     */
    DeploymentAssignResponseDTO allocateUnitsForDeploymentRequest(DeploymentAssignRequestDTO dto);

    /**
     * Retrieves the currently assigned incident for a given responder.
     *
     * This method is used by the responder mobile dashboard. When a responder logs in,
     * the mobile application calls this method to determine which incident is currently
     * assigned to the responder and to fetch the full incident details required for display.
     *
     * The method performs the following steps:
     *  - Resolves the responder's ResponseUnit using the responder (user) ID
     *  - Finds the latest ASSIGNED Deployment for that ResponseUnit
     *  - Extracts the incidentId from the Deployment
     *  - Calls the Incident Service to fetch the IncidentBasicDTO
     *
     * @param responderId the user ID of the responder
     * @return IncidentBasicDTO containing the details of the incident currently assigned to the responder
     * @throws IllegalArgumentException if no ResponseUnit or Deployment is found for the responder
     * @throws IllegalStateException if the found Deployment does not reference an incident
     */
    IncidentBasicDTO getIncidentBasicDtoForResponder(Long responderId);
}
