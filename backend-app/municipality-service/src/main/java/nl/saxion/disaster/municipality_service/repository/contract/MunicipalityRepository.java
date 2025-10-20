package nl.saxion.disaster.municipality_service.repository.contract;

import nl.saxion.disaster.municipality_service.model.entity.Municipality;

import java.util.List;
import java.util.Optional;

/**
 * Repository contract for manual database operations on the Municipality entity.
 * This interface is implemented using EntityManager (without JpaRepository).
 */
public interface MunicipalityRepository {

    /**
     * Retrieves all municipalities from the database.
     *
     * @return List of all Municipality entities
     */
    List<Municipality> findAllMunicipality();

    /**
     * Finds a specific municipality by its ID.
     *
     * @param id Municipality ID
     * @return Optional containing Municipality if found, otherwise empty
     */
    Optional<Municipality> findMunicipalityById(Long id);

    /**
     * Retrieves all municipalities that belong to a specific region.
     *
     * @param regionId ID of the region
     * @return List of Municipality entities belonging to the given region
     */
    List<Municipality> findMunicipalitiesByRegionId(Long regionId);

    /**
     * Persists a new municipality into the database.
     *
     * @param municipality Municipality entity to save
     * @return The newly created Municipality entity
     */
    Municipality createMunicipality(Municipality municipality);

    /**
     * Updates an existing municipality in the database.
     *
     * @param municipality Municipality entity with updated data
     * @return The updated Municipality entity
     */
    Municipality updateMunicipality(Municipality municipality);

    /**
     * Checks whether a municipality exists by its ID.
     *
     * @param id Municipality ID
     * @return true if a municipality exists with the given ID, false otherwise
     */
    boolean existsById(Long id);

    /**
     * Deletes a municipality from the database by its ID.
     *
     * @param id Municipality ID to delete
     */
    void deleteMunicipality(Long id);
}
