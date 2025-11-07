package nl.saxion.disaster.resourceservice.repository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import nl.saxion.disaster.resourceservice.repository.contract.ResourceRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
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
                        "SELECT resource FROM Resource resource WHERE resource.available > 0", Resource.class)
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

    /*
     * Fetches all available resources that match the given filters.
     * - Only returns resources with available > 0 (at least one unit free).
     * - Filters by resource type if provided.
     * - Filters by a single departmentId OR by multiple departmentIds (from a municipality), if provided.
     * - If no filters are provided, returns all available resources.
     */
    @Override
    public List<Resource> findAvailableResourcesByTypeAndDepartment(
            String resourceType,
            Long departmentId,
            List<Long> departmentIds) {

        List<Long> safeDepartmentIds = (departmentIds == null)
                ? List.of()
                : departmentIds.stream().filter(Objects::nonNull).distinct().toList();

        String queryStr = """
        SELECT r FROM Resource r
        WHERE r.available > 0
          AND (:resourceType IS NULL OR r.resourceType = :resourceType)
        """;

        if (departmentId != null) {
            queryStr += " AND r.departmentId = :departmentId";
        } else if (!safeDepartmentIds.isEmpty()) {
            queryStr += " AND r.departmentId IN :departmentIds";
        }

        var query = entityManager.createQuery(queryStr, Resource.class);

        // Set parameters safely
        query.setParameter("resourceType",
                (resourceType != null && !resourceType.isBlank()) ? ResourceType.valueOf(resourceType) : null);

        if (departmentId != null) {
            query.setParameter("departmentId", departmentId);
        } else if (!safeDepartmentIds.isEmpty()) {
            query.setParameter("departmentIds", safeDepartmentIds);
        }

        return query.getResultList();
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
        existing.setQuantity(updatedResource.getQuantity());
        existing.setAvailable(updatedResource.getAvailable());
        existing.setResourceType(updatedResource.getResourceType());
        existing.setLatitude(updatedResource.getLatitude());
        existing.setLongitude(updatedResource.getLongitude());
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
}
