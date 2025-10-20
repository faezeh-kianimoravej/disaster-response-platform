package nl.saxion.disaster.regionservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.service.contract.RegionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Region Management",
        description = "Endpoints for managing regions and retrieving their associated municipalities.")
@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegionController {

    private final RegionService regionService;

    @Operation(summary = "Get all regions",
            description = "Retrieve a list of all regions with their municipality IDs.")
    @GetMapping
    public ResponseEntity<List<RegionDto>> getAllRegions() {
        List<RegionDto> regions = regionService.getAllRegions();
        return ResponseEntity.ok(regions);
    }

    @Operation(summary = "Get region by ID",
            description = "Retrieve detailed information about a specific region by providing its unique ID.")
    @GetMapping("/{regionId}")
    public ResponseEntity<RegionDto> getRegionById(@PathVariable Long regionId) {
        RegionDto region = regionService.getRegionById(regionId);
        return ResponseEntity.ok(region);
    }

    @Operation(summary = "Create a new region",
            description = "Add a new region to the system by providing its name and optional list of municipality IDs.")
    @PostMapping
    public ResponseEntity<RegionDto> createRegion(@RequestBody RegionDto regionDto) {
        RegionDto created = regionService.createRegion(regionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing region",
            description = "Modify region information such as name or municipality list using its unique ID.")
    @PutMapping("/{regionId}")
    public ResponseEntity<RegionDto> updateRegion(@PathVariable Long regionId, @RequestBody RegionDto regionDto) {
        RegionDto updated = regionService.updateRegion(regionId, regionDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete region by ID",
            description = "Remove a region from the system using its unique ID. This action is permanent.")
    @DeleteMapping("/{regionId}")
    public ResponseEntity<Void> deleteRegion(@PathVariable Long regionId) {
        regionService.deleteRegion(regionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get municipalities of a region",
            description = "Retrieve all municipalities that belong to a specific region using its ID.")
    @GetMapping("/{regionId}/municipalities")
    public ResponseEntity<List<MunicipalityDto>> getAllMunicipalitiesOfRegion(@PathVariable Long regionId) {
        List<MunicipalityDto> municipalities = regionService.getAllMunicipalitiesOfRegion(regionId);
        return ResponseEntity.ok(municipalities);
    }
}
