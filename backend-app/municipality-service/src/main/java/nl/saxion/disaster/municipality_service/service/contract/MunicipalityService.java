package nl.saxion.disaster.municipality_service.service.contract;

import nl.saxion.disaster.municipality_service.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;

import java.util.List;

public interface MunicipalityService {

    List<MunicipalityDto> getAllMunicipalities();

    MunicipalityDto getMunicipalityById(Long id);

    List<MunicipalityDto> getMunicipalityDtoListByRegionId(Long regionId);

    MunicipalityDto createMunicipality(Municipality municipality);

    MunicipalityDto updateMunicipality(Long id, Municipality updatedMunicipality);

    void deleteMunicipality(Long id);

    List<DepartmentDto> getDepartmentsOfMunicipality(Long municipalityId);
}
