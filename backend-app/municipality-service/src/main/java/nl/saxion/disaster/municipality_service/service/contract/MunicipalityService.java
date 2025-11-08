package nl.saxion.disaster.municipality_service.service.contract;

import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityBasicDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalitySummaryDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;

import java.util.List;
import java.util.Optional;

public interface MunicipalityService {

    /**
     * Get all municipalities - returns simplified DTO without nested departments.
     */
    List<MunicipalitySummaryDto> getAllMunicipalities();

    /**
     * Get single municipality by ID - returns full DTO with nested department details.
     */
    MunicipalityDto getMunicipalityById(Long id);

    /**
     * Returns a lightweight version of a municipality (ID and name only).
     * <p>
     * This method is primarily used by other microservices — for example,
     * the <b>resource-service</b> — when only basic municipality data is
     * required to enrich department or resource details.
     * </p>
     * <p>
     * Designed for inter-service communication to minimize data transfer
     * and avoid cyclic dependencies.
     * </p>
     *
     * @param id the unique identifier of the municipality
     * @return an {@link Optional} containing {@link MunicipalityBasicDto} if found,
     * or an empty Optional if not found
     */
    Optional<MunicipalityBasicDto> getMunicipalityBasicInfoById(Long id);

    /**
     * Get municipalities by region ID - returns simplified summary DTOs.
     * This is used by region-service to populate nested municipalities (one level down only).
     */
    List<MunicipalitySummaryDto> getMunicipalitySummaryListByRegionId(Long regionId);

    /**
     * @deprecated Use getMunicipalitySummaryListByRegionId instead
     */
    @Deprecated
    List<MunicipalityDto> getMunicipalityDtoListByRegionId(Long regionId);

    MunicipalityDto createMunicipality(Municipality municipality);

    MunicipalityDto updateMunicipality(Long id, Municipality updatedMunicipality);

    void deleteMunicipality(Long id);

    List<DepartmentSummaryDto> getDepartmentsOfMunicipality(Long municipalityId);

    List<Long> getDepartmentIdsByMunicipalityId(Long municipalityId);
}
