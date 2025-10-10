package nl.saxion.disaster.departmentservice.repository;

import nl.saxion.disaster.departmentservice.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
