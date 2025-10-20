package nl.saxion.disaster.regionservice.repository.contract;

import nl.saxion.disaster.regionservice.model.Region;

import java.util.List;
import java.util.Optional;

public interface RegionRepository {

    /**
     * Retrieves all regions from the database.
     *
     * @return list of all Region entities
     */
    List<Region> findAllRegions();

    /**
     * Finds a region by its ID.
     *
     * @param id the region ID
     * @return Optional of Region if found
     */
    Optional<Region> findRegionById(Long id);

    /**
     * Saves a new region or updates an existing one.
     *
     * @param region Region entity to persist
     * @return persisted Region entity
     */
    Region createRegion(Region region);

    /**
     * Updates an existing region (shortcut to saveRegion for clarity).
     *
     * @param region Region entity to update
     * @return updated Region entity
     */
    Region updateRegion(Region region);

    /**
     * Deletes a region by its ID.
     *
     * @param id the region ID
     */
    void deleteRegionById(Long id);
}
