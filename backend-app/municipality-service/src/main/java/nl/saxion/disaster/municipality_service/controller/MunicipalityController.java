package nl.saxion.disaster.municipality_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalitySummaryDto;
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
public class MunicipalityController {

    private final MunicipalityService municipalityService;

    @Operation(
            summary = "Get all municipalities",
            description = "Retrieve a simplified list of all municipalities without nested departments to avoid deep nesting."
    )
    @GetMapping
    public ResponseEntity<List<MunicipalitySummaryDto>> getAllMunicipalities() {
        List<MunicipalitySummaryDto> municipalities = municipalityService.getAllMunicipalities();
        return ResponseEntity.ok(municipalities);
    }

    @Operation(
            summary = "Get municipality by ID",
            description = "Retrieve detailed information about a specific municipality with full nested department details."
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
    @PostMapping
    public ResponseEntity<MunicipalityDto> createMunicipality(@RequestBody Municipality municipality) {
        MunicipalityDto created = municipalityService.createMunicipality(municipality);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "Update existing municipality",
            description = "Update the name or department list of an existing municipality by its ID."
    )
    @PutMapping("/{id}")
    public ResponseEntity<MunicipalityDto> updateMunicipality(@PathVariable Long id,
                                                              @RequestBody Municipality updatedMunicipality) {
        MunicipalityDto updatedMunicipalityDto = municipalityService.updateMunicipality(id, updatedMunicipality);
        return ResponseEntity.ok(updatedMunicipalityDto);
    }

    @Operation(
            summary = "Delete municipality by ID",
            description = "Remove a municipality from the system using its unique ID. This action is irreversible."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMunicipality(@PathVariable Long id) {
        municipalityService.deleteMunicipality(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get departments of a municipality",
            description = "Retrieve all departments that belong to a specific municipality (simplified DTOs without resources)."
    )
    @GetMapping("/{id}/departments")
    public ResponseEntity<List<DepartmentSummaryDto>> getDepartmentsByMunicipalityId(@PathVariable("id") Long municipalityId) {
        List<DepartmentSummaryDto> departments = municipalityService.getDepartmentsOfMunicipality(municipalityId);
        return ResponseEntity.ok(departments);
    }

    /**
     * Retrieves all municipalities belonging to a specific region.
     * Returns simplified DTOs without departmentIds to limit nesting to one level.
     * <p>
     * Example:
     * GET /api/municipalities/region/5
     *
     * @param regionId the ID of the region
     * @return list of MunicipalitySummaryDto (without departmentIds)
     */
    @GetMapping("/region/{regionId}")
    public ResponseEntity<List<MunicipalitySummaryDto>> getMunicipalitiesByRegion(@PathVariable Long regionId) {
        List<MunicipalitySummaryDto> municipalities = municipalityService.getMunicipalitySummaryListByRegionId(regionId);
        return ResponseEntity.ok(municipalities);
    }
}
