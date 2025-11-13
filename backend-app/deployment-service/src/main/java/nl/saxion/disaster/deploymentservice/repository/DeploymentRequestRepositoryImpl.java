package nl.saxion.disaster.deploymentservice.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRequestRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class DeploymentRequestRepositoryImpl implements DeploymentRequestRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public DeploymentRequest save(DeploymentRequest request) {
        if (request.getRequestId() == null || request.getRequestId() == 0) {
            em.persist(request);
            return request;
        }
        return em.merge(request);
    }

    @Override
    public List<DeploymentRequest> saveAll(List<DeploymentRequest> requests) {
        for (DeploymentRequest r : requests) {
            if (r.getRequestId() == null || r.getRequestId() == 0) {
                em.persist(r);
            } else {
                em.merge(r);
            }
        }
        return requests;
    }

    @Override
    public Optional<DeploymentRequest> findById(Long id) {
        return Optional.ofNullable(em.find(DeploymentRequest.class, id));
    }

    @Override
    public List<DeploymentRequest> findAllByOrderId(Long deploymentOrderId) {
        return em.createQuery(
                "SELECT r FROM DeploymentRequest r WHERE r.deploymentOrder.deploymentOrderId = :orderId",
                DeploymentRequest.class)
            .setParameter("orderId", deploymentOrderId)
            .getResultList();
    }
}
