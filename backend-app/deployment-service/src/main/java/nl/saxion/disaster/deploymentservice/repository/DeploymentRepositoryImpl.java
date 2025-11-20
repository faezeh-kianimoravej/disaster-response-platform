package nl.saxion.disaster.deploymentservice.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.deploymentservice.model.Deployment;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class DeploymentRepositoryImpl implements DeploymentRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Deployment createDeployment(Deployment deployment) {
        entityManager.persist(deployment);
        entityManager.flush();
        return deployment;
    }

    @Override
    public List<Deployment> createDeploymentList(List<Deployment> deployments) {
        for (Deployment dep : deployments) {
            entityManager.persist(dep);
        }
        entityManager.flush();
        return deployments;
    }

    @Override
    public Optional<Deployment> findDeploymentById(Long id) {
        Deployment d = entityManager.find(Deployment.class, id);
        return Optional.ofNullable(d);
    }
}
