package nl.saxion.disaster.deploymentservice.repository.contract;

import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseUnitRepository extends JpaRepository<ResponseUnit, Long> {
    List<ResponseUnit> findResponseUnitByDepartmentId(Long departmentId);

    List<ResponseUnit> findResponseUnitByDepartmentIdAndUnitTypeAndStatus(Long departmentId, ResponseUnitType unitType, ResponseUnitStatus status);
}
