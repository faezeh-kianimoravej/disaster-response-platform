package nl.saxion.disaster.departmentservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.dto.ResourceSummaryDto;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Department Management",
        description = "Endpoints for managing departments and retrieving their related resources or municipalities.")
@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @Operation(summary = "Get all departments",
            description = "Retrieve a simplified list of all departments without nested resources to avoid deep nesting.")
    @GetMapping
    public ResponseEntity<List<DepartmentSummaryDto>> getAllDepartments() {
        List<DepartmentSummaryDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @Operation(summary = "Get department by ID",
            description = "Retrieve detailed information about a specific department with full nested resource details.")
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new department",
            description = "Add a new department to the system by providing its name and optional list of resources.")
    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(@RequestBody DepartmentDto departmentDto) {
        DepartmentDto createdDepartment = departmentService.createDepartment(departmentDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
    }

    @Operation(summary = "Update an existing department",
            description = "Modify department information such as name or resource list using its unique ID.")
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDto departmentDto) {

        DepartmentDto updatedDepartment = departmentService.updateDepartment(id, departmentDto);
        return ResponseEntity.ok(updatedDepartment);
    }

    @Operation(summary = "Delete department by ID",
            description = "Remove a department from the system using its unique ID. This action is permanent.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get resources of a department",
            description = "Retrieve all resources that belong to a specific department using its ID.")
    @GetMapping("/{departmentId}/resources")
    public ResponseEntity<List<ResourceSummaryDto>> getResourcesByDepartment(@PathVariable("departmentId") Long departmentId) {
        List<ResourceSummaryDto> resources = departmentService.getResourcesOfDepartment(departmentId);
        return ResponseEntity.ok(resources);
    }

    @Operation(summary = "Get departments by municipality ID",
            description = "Retrieve all departments that belong to a specific municipality (simplified DTO without resources).")
    @GetMapping("/municipality/{municipalityId}")
    public List<DepartmentSummaryDto> getDepartmentsByMunicipality(@PathVariable Long municipalityId) {
        return departmentService.getDepartmentsByMunicipality(municipalityId);
    }
}
