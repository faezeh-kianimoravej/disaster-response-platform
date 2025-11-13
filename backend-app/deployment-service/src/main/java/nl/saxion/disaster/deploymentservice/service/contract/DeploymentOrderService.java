package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;

public interface DeploymentOrderService {
    DeploymentOrderDTO createDeploymentOrder(DeploymentOrderCreateDTO dto);
    DeploymentOrderDTO getDeploymentOrderByIncidentId(Long incidentId);
}