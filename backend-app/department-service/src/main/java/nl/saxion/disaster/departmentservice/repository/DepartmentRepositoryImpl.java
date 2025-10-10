package nl.saxion.disaster.departmentservice.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
@RequiredArgsConstructor
public class DepartmentRepositoryImpl implements DepartmentRepository {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    public List<Department> findAllDepartments() {
        return entityManager.createQuery("SELECT d FROM Department d", Department.class)
                .getResultList();
    }

    @Override
    public Optional<Department> findDepartmentById(Long id) {
        Department department = entityManager.find(Department.class, id);
        return Optional.ofNullable(department);
    }

    @Override
    public Department createDepartment(Department department) {
        entityManager.persist(department);
        return department;
    }

    @Override
    public Department updateDepartment(Department department) {
        return entityManager.merge(department);
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = entityManager.find(Department.class, id);
        if (department != null) {
            entityManager.remove(department);
        }
    }
}
