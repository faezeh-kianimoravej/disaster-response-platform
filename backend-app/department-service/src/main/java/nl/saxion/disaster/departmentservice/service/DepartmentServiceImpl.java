package nl.saxion.disaster.departmentservice.service;

import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAllDepartments();
    }

    @Override
    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findDepartmentById(id);
    }

    @Override
    public Department createDepartment(Department department) {
        return departmentRepository.createDepartment(department);
    }

    @Override
    public Department updateDepartment(Long id, Department departmentDetails) {
        return departmentRepository.updateDepartment(departmentDetails);
    }

    @Override
    public void deleteDepartment(Long id) {
        departmentRepository.deleteDepartment(id);
    }

}
