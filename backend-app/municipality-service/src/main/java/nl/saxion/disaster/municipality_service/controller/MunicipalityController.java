package nl.saxion.disaster.municipality_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.municipality_service.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.service.contract.MunicipalityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Municipality Management",
        description = "Endpoints for managing municipalities and viewing their departments within the disaster response system."
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/municipalities")
@CrossOrigin(origins = "*")
public class MunicipalityController {

    private final MunicipalityService municipalityService;

    @Operation(
            summary = "Get all municipalities",
            description = "Retrieve a complete list of all municipalities available in the system."
    )
    @GetMapping("/all")
    public ResponseEntity<List<MunicipalityDto>> getAllMunicipalities() {
        List<MunicipalityDto> municipalities = municipalityService.getAllMunicipalities();
        return ResponseEntity.ok(municipalities);
    }

    @Operation(
            summary = "Get municipality by ID",
            description = "Retrieve detailed information about a specific municipality by providing its unique ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<MunicipalityDto> getMunicipalityById(@PathVariable Long id) {
        MunicipalityDto municipalityDto = municipalityService.getMunicipalityById(id);
        return ResponseEntity.ok(municipalityDto);
    }

    @Operation(
            summary = "Create a new municipality",
            description = "Add a new municipality to the system by providing its name and associated department IDs."
    )
    @PostMapping("/create")
    public ResponseEntity<MunicipalityDto> createMunicipality(@RequestBody Municipality municipality) {
        MunicipalityDto created = municipalityService.createMunicipality(municipality);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "Update existing municipality",
            description = "Update the name or department list of an existing municipality by its ID."
    )
    @PutMapping("/update/{id}")
    public ResponseEntity<MunicipalityDto> updateMunicipality(@PathVariable Long id,
                                                              @RequestBody Municipality updatedMunicipality) {
        MunicipalityDto updatedMunicipalityDto = municipalityService.updateMunicipality(id, updatedMunicipality);
        return ResponseEntity.ok(updatedMunicipalityDto);
    }

    @Operation(
            summary = "Delete municipality by ID",
            description = "Remove a municipality from the system using its unique ID. This action is irreversible."
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMunicipality(@PathVariable Long id) {
        municipalityService.deleteMunicipality(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get departments of a municipality",
            description = "Retrieve all departments that belong to a specific municipality by its ID."
    )
    @GetMapping("/{id}/departments")
    public ResponseEntity<List<DepartmentDto>> getDepartmentsByMunicipalityId(@PathVariable("id") Long municipalityId) {
        List<DepartmentDto> departments = municipalityService.getDepartmentsOfMunicipality(municipalityId);
        return ResponseEntity.ok(departments);
    }
}
