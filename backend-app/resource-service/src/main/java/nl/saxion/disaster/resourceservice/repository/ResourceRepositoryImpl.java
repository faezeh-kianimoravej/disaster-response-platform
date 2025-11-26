package nl.saxion.disaster.resourceservice.repository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import nl.saxion.disaster.resourceservice.model.enums.ResourceKind;
import nl.saxion.disaster.resourceservice.model.enums.ResourceStatus;
import nl.saxion.disaster.resourceservice.repository.contract.ResourceRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class ResourceRepositoryImpl implements ResourceRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Resource> findById(Long id) {
        Resource resource = entityManager.find(Resource.class, id);
        return Optional.ofNullable(resource);
    }

    @Override
    public List<Resource> findAllAvailableResources() {
        return entityManager.createQuery(
            "SELECT r FROM Resource r " +
            "WHERE (r.resourceKind = :uniqueKind AND r.status = :availableStatus) " +
            "OR (r.resourceKind IN (:stackableKind, :consumableKind) AND r.availableQuantity > 0)",
            Resource.class)
            .setParameter("uniqueKind", ResourceKind.UNIQUE)
            .setParameter("stackableKind", ResourceKind.STACKABLE)
            .setParameter("consumableKind", ResourceKind.CONSUMABLE)
            .setParameter("availableStatus", ResourceStatus.AVAILABLE)
            .getResultList();
    }

    @Override
    public List<Resource> findByType(ResourceType type) {
        return entityManager.createQuery(
                "SELECT r FROM Resource r WHERE r.resourceType = :resourceType", Resource.class)
            .setParameter("resourceType", type)
            .getResultList();
    }

    @Override
    public List<Resource> findByDepartment(Long departmentId) {
        return entityManager.createQuery(
                        "SELECT r FROM Resource r WHERE r.departmentId = :deptId", Resource.class)
                .setParameter("deptId", departmentId)
                .getResultList();
    }

    @Override
    public Resource save(Resource resource) {
        entityManager.persist(resource);
        return resource;
    }

    @Override
    public Resource edit(Long id, Resource updatedResource) {
        Resource existing = entityManager.find(Resource.class, id);
        if (existing == null) {
            throw new IllegalArgumentException("Resource not found with id: " + id);
        }

        existing.setName(updatedResource.getName());
        existing.setDescription(updatedResource.getDescription());
        existing.setCategory(updatedResource.getCategory());
        existing.setResourceType(updatedResource.getResourceType());
        existing.setResourceKind(updatedResource.getResourceKind());
        existing.setStatus(updatedResource.getStatus());
        existing.setTotalQuantity(updatedResource.getTotalQuantity());
        existing.setAvailableQuantity(updatedResource.getAvailableQuantity());
        existing.setUnit(updatedResource.getUnit());
        existing.setIsTrackable(updatedResource.getIsTrackable());
        existing.setLatitude(updatedResource.getLatitude());
        existing.setLongitude(updatedResource.getLongitude());
        existing.setLastLocationUpdate(updatedResource.getLastLocationUpdate());
        existing.setCurrentDeploymentId(updatedResource.getCurrentDeploymentId());
        existing.setDeployedQuantity(updatedResource.getDeployedQuantity());
        existing.setImage(updatedResource.getImage());
        existing.setDepartmentId(updatedResource.getDepartmentId());

        return entityManager.merge(existing);
    }

    @Override
    public void deleteById(Long id) {
        Resource resource = entityManager.find(Resource.class, id);
        if (resource != null) {
            entityManager.remove(resource);
        }
    }

    /**
     * Atomically allocate resource quantities:
     *  - decrease availableQuantity
     *  - increase deployedQuantity
     *  - assign resource to deployment
     *
     * Returns number of updated rows (0 means failure).
     */
    @Override
    public int allocateResource(Long resourceId, Integer quantity, Long deploymentId) {

        return entityManager.createQuery("""
                UPDATE Resource r
                SET r.availableQuantity = r.availableQuantity - :qty,
                    r.deployedQuantity = 
                        CASE 
                            WHEN r.deployedQuantity IS NULL THEN :qty
                            ELSE r.deployedQuantity + :qty
                        END,
                    r.currentDeploymentId = :deploymentId
                WHERE r.resourceId = :id
                AND r.availableQuantity >= :qty
            """)
                .setParameter("qty", quantity)
                .setParameter("deploymentId", deploymentId)
                .setParameter("id", resourceId)
                .executeUpdate();
    }
}
