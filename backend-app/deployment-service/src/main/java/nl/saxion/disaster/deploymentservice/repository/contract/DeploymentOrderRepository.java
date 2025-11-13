package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;

import java.util.List;
import java.util.Optional;

public interface DeploymentOrderRepository {
    DeploymentOrder saveDeploymentOrder(DeploymentOrder order);
    Optional<DeploymentOrder> findDeploymentOrderById(Long id);
    List<DeploymentOrder> findAllDeploymentOrders();
    void deleteDeploymentOrderById(Long id);
    Optional<DeploymentOrder> findDeploymentOrderByIncidentId(Long incidentId);
}