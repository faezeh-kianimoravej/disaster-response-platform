package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;

public interface DeploymentService {

    /**
     * Assigns real ResponseUnits to a DeploymentRequest.
     * Backend:
     * - Loads DeploymentRequest
     * - Reads requestedQuantity
     * - Finds suitable available ResponseUnits
     * - Validates personnel & resources
     * - Creates N Deployments (N = units assigned)
     * - Updates ResponseUnit.status and Request.status
     *
     * @param requestId the DeploymentRequest ID
     * @param dto       data from frontend (assignedBy, notes)
     * @return response containing created deployments and new request status
     */
    DeploymentAssignResponseDTO allocateUnitsForDeploymentRequest(Long requestId, DeploymentAssignRequestDTO dto);
}
