package nl.saxion.disaster.regionservice.controller;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.service.contract.RegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    /**
     * Get all regions with their municipality IDs.
     *
     * @return list of RegionDto
     */
    @GetMapping
    public ResponseEntity<List<RegionDto>> getAllRegions() {
        List<RegionDto> regions = regionService.getAllRegions();
        return ResponseEntity.ok(regions);
    }

    /**
     * Get a region by ID (including its municipality IDs).
     *
     * @param regionId region ID
     * @return RegionDto
     */
    @GetMapping("/{regionId}")
    public ResponseEntity<RegionDto> getRegionById(@PathVariable Long regionId) {
        RegionDto region = regionService.getRegionById(regionId);
        return ResponseEntity.ok(region);
    }

    /**
     * Create a new region.
     *
     * @param regionDto region data
     * @return created RegionDto
     */
    @PostMapping
    public ResponseEntity<RegionDto> createRegion(@RequestBody RegionDto regionDto) {
        RegionDto created = regionService.createRegion(regionDto);
        return ResponseEntity.ok(created);
    }

    /**
     * Get all municipalities of a specific region.
     *
     * @param regionId region ID
     * @return list of MunicipalityDto
     */
    @GetMapping("/{regionId}/municipalities")
    public ResponseEntity<List<MunicipalityDto>> getAllMunicipalitiesOfRegion(@PathVariable Long regionId) {
        List<MunicipalityDto> municipalities = regionService.getAllMunicipalitiesOfRegion(regionId);
        return ResponseEntity.ok(municipalities);
    }
}
