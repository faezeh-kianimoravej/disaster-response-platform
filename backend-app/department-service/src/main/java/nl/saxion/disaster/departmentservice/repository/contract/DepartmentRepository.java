package nl.saxion.disaster.departmentservice.repository.contract;

import nl.saxion.disaster.departmentservice.model.entity.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository {

    List<Department> findAllDepartments();

    Optional<Department> findDepartmentById(Long id);

    Department createDepartment(Department department);

    Department updateDepartment(Department department);

    void deleteDepartment(Long id);

    List<Department> findDepartmentByMunicipalityId(Long municipalityId);
}
