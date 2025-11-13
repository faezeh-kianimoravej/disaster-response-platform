package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseUnitRepository extends JpaRepository<ResponseUnit, Long> {
    List<ResponseUnit> findByDepartmentId(Long departmentId);
}
