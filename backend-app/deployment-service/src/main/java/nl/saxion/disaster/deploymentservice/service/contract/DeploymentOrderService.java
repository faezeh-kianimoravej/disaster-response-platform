package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;

import java.util.List;

public interface DeploymentOrderService {

    DeploymentOrderDTO createDeploymentOrder(DeploymentOrderCreateDTO dto);

    public List<DeploymentOrderDTO> getDeploymentOrdersByIncidentId(Long id);
}