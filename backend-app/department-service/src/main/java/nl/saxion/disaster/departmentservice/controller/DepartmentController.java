package nl.saxion.disaster.departmentservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.model.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;
import org.hibernate.sql.model.PreparableMutationOperation;
import org.springframework.http.HttpStatus;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Tag(
        name = "Department Management",
        description = "Endpoints for managing departments and retrieving their related resources or municipalities."
)
@RestController
@RequestMapping("/api/department")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Operation(
            summary = "Get all departments",
            description = "Retrieve a list of all departments currently available in the system."
    )
    @GetMapping("/all_departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @Operation(
            summary = "Get department by ID",
            description = "Retrieve detailed information about a specific department by providing its unique ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Create a new department",
            description = "Add a new department to the system by providing its name and optional list of resources."
    )
    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department created = departmentService.createDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "Update an existing department",
            description = "Modify department information such as name or resource list using its unique ID."
    )
    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department departmentDetails) {
        Department updated = departmentService.updateDepartment(id, departmentDetails);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Delete department by ID",
            description = "Remove a department from the system using its unique ID. This action is permanent."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get resources of a department",
            description = "Retrieve all resources that belong to a specific department using its ID."
    )
    @GetMapping("/{id}/resources")
    public ResponseEntity<List<Resource>> getResourcesByDepartment(@PathVariable Long id) {
        return departmentService.getDepartmentById(id)
                .map(department -> ResponseEntity.ok(department.getResources()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Get departments by municipality ID",
            description = "Retrieve all departments that belong to a specific municipality by its unique ID."
    )
    @GetMapping("/by-municipality/{municipalityId}")
    public List<DepartmentDto> getDepartmentsByMunicipality(@PathVariable Long municipalityId) {
        return departmentService.getDepartmentsByMunicipality(municipalityId);
    }
}
