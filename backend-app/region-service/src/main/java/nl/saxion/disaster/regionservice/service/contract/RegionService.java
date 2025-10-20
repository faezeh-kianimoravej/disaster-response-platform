package nl.saxion.disaster.regionservice.service.contract;

import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.dto.RegionSummaryDto;

import java.util.List;

public interface RegionService {

    /**
     * Retrieves all regions without nested municipalities.
     * Returns simplified RegionSummaryDto to avoid deep nesting in collection responses.
     *
     * @return List of RegionSummaryDto objects
     */
    List<RegionSummaryDto> getAllRegions();

    /**
     * Retrieves a single region by its ID, including full nested municipality details.
     *
     * @param regionId ID of the region
     * @return RegionDto object with nested municipalities
     */
    RegionDto getRegionById(Long regionId);

    /**
     * Creates a new region.
     *
     * @param regionDto region data
     * @return created RegionDto
     */
    RegionDto createRegion(RegionDto regionDto);

    /**
     * Updates an existing region.
     *
     * @param regionId ID of the region to update
     * @param regionDto updated region data
     * @return updated RegionDto
     */
    RegionDto updateRegion(Long regionId, RegionDto regionDto);

    /**
     * Deletes a region by its ID.
     *
     * @param regionId ID of the region to delete
     */
    void deleteRegion(Long regionId);

    /**
     * Retrieves all municipalities of a specific region.
     *
     * @param regionId ID of the region
     * @return all municipalities of a region
     */
    List<MunicipalityDto> getAllMunicipalitiesOfRegion(Long regionId);
}
