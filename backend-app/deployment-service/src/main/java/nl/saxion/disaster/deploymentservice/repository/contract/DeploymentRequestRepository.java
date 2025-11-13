package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;

import java.util.List;
import java.util.Optional;

public interface DeploymentRequestRepository {
    DeploymentRequest save(DeploymentRequest request);
    List<DeploymentRequest> saveAll(List<DeploymentRequest> requests);
    Optional<DeploymentRequest> findById(Long id);
    List<DeploymentRequest> findAllByOrderId(Long deploymentOrderId);
}