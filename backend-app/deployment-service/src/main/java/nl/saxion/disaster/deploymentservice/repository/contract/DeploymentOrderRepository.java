package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;

import java.util.List;
import java.util.Optional;

public interface DeploymentOrderRepository {
    DeploymentOrder save(DeploymentOrder order);
    Optional<DeploymentOrder> findById(Long id);
    List<DeploymentOrder> findAll();
    void deleteById(Long id);
    Optional<DeploymentOrder> findByIncidentId(Long incidentId);
}