package nl.saxion.disaster.municipality_service.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityBasicDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalitySummaryDto;
import nl.saxion.disaster.municipality_service.exception.MunicipalityNotFoundException;
import nl.saxion.disaster.municipality_service.mapper.MunicipalityMapper;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.repository.contract.MunicipalityRepository;
import nl.saxion.disaster.municipality_service.service.contract.MunicipalityService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MunicipalityServiceImpl implements MunicipalityService {

    private final MunicipalityRepository repository;
    private final DepartmentClient departmentClient;
    private final MunicipalityMapper mapper;

    /**
     * Get all municipalities - returns simplified DTO without nested departments.
     * This prevents deep nesting in collection responses.
     */
    @Override
    public List<MunicipalitySummaryDto> getAllMunicipalities() {
        return repository.findAllMunicipality()
                .stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    /**
     * Get single municipality by ID - returns full DTO with nested department details.
     * This provides complete details for individual resource requests.
     */
    @Override
    public MunicipalityDto getMunicipalityById(Long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("Municipality ID must be a positive number");
        }

        Municipality municipality = repository.findMunicipalityById(id)
                .orElseThrow(() -> new MunicipalityNotFoundException("Municipality not found with id: " + id));

        MunicipalityDto dto = mapper.toDto(municipality);

        // Fetch department summaries from department-service
        List<DepartmentSummaryDto> departments = departmentClient.getDepartmentsByMunicipality(id);

        return new MunicipalityDto(
                dto.municipalityId(),
                dto.regionId(),
                dto.name(),
                dto.image(),
                departments != null ? departments : Collections.emptyList()
        );
    }

    /**
     * Retrieves a lightweight version of a Municipality entity by its unique ID.
     * <p>
     * This method is specifically designed for inter-service communication —
     * for example, when the <b>resource-service</b> needs to display department
     * and municipality names together while allocating or viewing resources.
     * </p>
     * <p>
     * Only basic information (ID and name) is returned to minimize payload size
     * and avoid circular dependencies between microservices.
     * </p>
     *
     * @param id the unique identifier of the municipality
     * @return an {@link Optional} containing {@link MunicipalityBasicDto} if found,
     * or an empty Optional if the municipality does not exist
     */
    @Override
    public Optional<MunicipalityBasicDto> getMunicipalityBasicInfoById(Long id) {
        return repository.findMunicipalityById(id)
                .map(municipality ->
                        new MunicipalityBasicDto(municipality.getMunicipalityId(),
                                municipality.getName()));
    }

    /**
     * Retrieves a list of MunicipalitySummaryDto objects for a given region.
     * Returns simplified DTOs without departmentIds to limit nesting to one level.
     *
     * @param regionId the ID of the region
     * @return list of MunicipalitySummaryDto (never null)
     */
    @Override
    public List<MunicipalitySummaryDto> getMunicipalitySummaryListByRegionId(Long regionId) {
        List<Municipality> municipalities = repository.findMunicipalitiesByRegionId(regionId);

        if (municipalities == null || municipalities.isEmpty()) {
            return Collections.emptyList();
        }
        return municipalities.stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    /**
     * @deprecated Use getMunicipalitySummaryListByRegionId instead
     */
    @Deprecated
    @Override
    public List<MunicipalityDto> getMunicipalityDtoListByRegionId(Long regionId) {
        List<Municipality> municipalities = repository.findMunicipalitiesByRegionId(regionId);

        if (municipalities == null || municipalities.isEmpty()) {
            return Collections.emptyList();
        }
        return municipalities.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MunicipalityDto createMunicipality(Municipality municipality) {
        Municipality created = repository.createMunicipality(municipality);
        return mapper.toDto(created);
    }

    @Override
    public MunicipalityDto updateMunicipality(Long id, Municipality updatedMunicipality) {
        Municipality existing = repository.findMunicipalityById(id)
                .orElseThrow(() -> new MunicipalityNotFoundException(id));

        existing.setName(updatedMunicipality.getName());
        existing.setRegionId(updatedMunicipality.getRegionId());

        if (updatedMunicipality.getImage() != null) {
            existing.setImage(updatedMunicipality.getImage());
        }

        if (updatedMunicipality.getDepartmentIds() != null) {
            existing.setDepartmentIds(new ArrayList<>(updatedMunicipality.getDepartmentIds()));
        } else {
            existing.setDepartmentIds(new ArrayList<>());
        }

        Municipality saved = repository.createMunicipality(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteMunicipality(Long id) {
        if (!repository.existsById(id)) {
            throw new MunicipalityNotFoundException("Municipality not found with id: " + id);
        }
        repository.deleteMunicipality(id);
    }

    @Override
    public List<DepartmentSummaryDto> getDepartmentsOfMunicipality(Long municipalityId) {
        Municipality municipality = repository.findMunicipalityById(municipalityId)
                .orElseThrow(() -> new MunicipalityNotFoundException(municipalityId));

        return departmentClient.getDepartmentsByMunicipality(municipality.getMunicipalityId());
    }
}
