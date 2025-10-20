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
     *
     * @param regionId
     * @return all municipality of a region
     */
    List<MunicipalityDto> getAllMunicipalitiesOfRegion(Long regionId);
}
