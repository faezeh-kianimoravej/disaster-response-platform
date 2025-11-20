package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.model.Deployment;

import java.util.List;
import java.util.Optional;

public interface DeploymentRepository {

    Deployment createDeployment(Deployment deployment);

    List<Deployment> createDeploymentList(List<Deployment> deployments);

    Optional<Deployment> findDeploymentById(Long id);
}
