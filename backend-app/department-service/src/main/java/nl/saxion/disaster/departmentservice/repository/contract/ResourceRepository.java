package nl.saxion.disaster.departmentservice.repository.contract;

import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository {

    Optional<Resource> findById(Long id);

    List<Resource> findAvailable();

    List<Resource> findByType(ResourceType type);

    List<Resource> findByDepartment(Long departmentId);

    Resource save(Resource resource);

    Resource edit(Long id, Resource updatedResource);

    void deleteById(Long id);

}
