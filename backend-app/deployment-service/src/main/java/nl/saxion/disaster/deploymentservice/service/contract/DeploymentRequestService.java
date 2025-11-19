package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;

import java.util.List;
import java.util.Optional;

public interface DeploymentRequestService {

    Optional<DeploymentRequestDTO> getDeploymentRequestById(Long id);
    List<DeploymentRequestDTO> getDeploymentRequestsByDepartmentId(Long departmentId);
}
