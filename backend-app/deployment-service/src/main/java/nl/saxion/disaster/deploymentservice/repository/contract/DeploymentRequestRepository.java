package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;

import java.util.List;
import java.util.Optional;

public interface DeploymentRequestRepository {
    DeploymentRequest saveDeploymentRequest(DeploymentRequest request);
    List<DeploymentRequest> saveAllDeploymentRequests(List<DeploymentRequest> requests);
    Optional<DeploymentRequest> findDeploymentRequestById(Long id);
    List<DeploymentRequest> findAllDeploymentRequestsByOrderId(Long deploymentOrderId);
}