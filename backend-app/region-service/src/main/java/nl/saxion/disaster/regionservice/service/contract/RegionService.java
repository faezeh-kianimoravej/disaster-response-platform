package nl.saxion.disaster.regionservice.service.contract;

import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;

import java.util.List;

public interface RegionService {

    /**
     * Retrieves all regions with their related municipality IDs
     * (fetched from municipality-service via Feign client).
     *
     * @return List of RegionDto objects
     */
    List<RegionDto> getAllRegions();

    /**
     * Retrieves a single region by its ID, including its municipality IDs.
     *
     * @param regionId ID of the region
     * @return RegionDto object
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
