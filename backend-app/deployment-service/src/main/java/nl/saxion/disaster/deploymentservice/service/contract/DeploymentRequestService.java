package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;

import java.util.List;

public interface DeploymentRequestService {

    List<DeploymentRequestDTO> getDeploymentRequestsByDepartmentId(Long departmentId);
}
