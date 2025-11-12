package nl.saxion.disaster.deploymentservice.repository.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class DeploymentOrderRepositoryImpl implements DeploymentOrderRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public DeploymentOrder save(DeploymentOrder order) {
        if (order.getDeploymentOrderId() == null || order.getDeploymentOrderId() == 0) {
            em.persist(order);
            em.flush();
            return order;
        }
        return em.merge(order);
    }

    @Override
    public Optional<DeploymentOrder> findById(Long id) {
        return Optional.ofNullable(em.find(DeploymentOrder.class, id));
    }

    @Override
    public List<DeploymentOrder> findAll() {
        return em.createQuery("SELECT o FROM DeploymentOrder o", DeploymentOrder.class).getResultList();
    }

    @Override
    public void deleteById(Long id) {
        DeploymentOrder found = em.find(DeploymentOrder.class, id);
        if (found != null) em.remove(found);
    }
}
