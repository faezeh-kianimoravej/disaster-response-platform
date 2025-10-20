package nl.saxion.disaster.municipality_service.service.contract;

import nl.saxion.disaster.municipality_service.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalitySummaryDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;

import java.util.List;

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
}
