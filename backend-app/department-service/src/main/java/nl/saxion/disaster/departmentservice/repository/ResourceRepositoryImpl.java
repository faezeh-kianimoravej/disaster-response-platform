package nl.saxion.disaster.departmentservice.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
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
    public List<Resource> findAvailable() {
        return entityManager.createQuery(
                        "SELECT r FROM Resource r WHERE r.available = true", Resource.class)
                .getResultList();
    }

    @Override
    public List<Resource> findByType(ResourceType type) {
        return entityManager.createQuery(
                        "SELECT r FROM Resource r WHERE r.resourceType = :type", Resource.class)
                .setParameter("type", type)
                .getResultList();
    }

    @Override
    public List<Resource> findByDepartment(Long departmentId) {
        return entityManager.createQuery(
                        "SELECT r FROM Resource r WHERE r.department.departmentId = :deptId", Resource.class)
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
        existing.setQuantity(updatedResource.getQuantity());
        existing.setAvailable(updatedResource.isAvailable());
        existing.setResourceType(updatedResource.getResourceType());
        existing.setLatitude(updatedResource.getLatitude());
        existing.setLongitude(updatedResource.getLongitude());
        existing.setImage(updatedResource.getImage());
        existing.setDepartment(updatedResource.getDepartment());

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
