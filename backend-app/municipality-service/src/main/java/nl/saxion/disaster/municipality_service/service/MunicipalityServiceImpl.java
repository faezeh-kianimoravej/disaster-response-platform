package nl.saxion.disaster.municipality_service.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.exception.MunicipalityNotFoundException;
import nl.saxion.disaster.municipality_service.model.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.model.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.repository.contract.MunicipalityRepository;
import nl.saxion.disaster.municipality_service.service.contract.MunicipalityService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MunicipalityServiceImpl implements MunicipalityService {

    private final MunicipalityRepository repository;
    private final DepartmentClient departmentClient;


    @Override
    public List<MunicipalityDto> getAllMunicipalities() {

        return repository.findAllMunicipality()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MunicipalityDto getMunicipalityById(Long id) {
        if (id > 0) {
            Municipality municipality = repository.findMunicipalityById(id)
                    .orElseThrow(() -> new MunicipalityNotFoundException("Municipality not found with id: " + id));

            return new MunicipalityDto(
                    municipality.getMunicipalityId(),
                    municipality.getRegionId(),
                    municipality.getName(),
                    municipality.getDepartmentIds() != null
                            ? List.copyOf(municipality.getDepartmentIds())
                            : List.of()
            );
        } else {
            throw new IllegalArgumentException("Municipality ID must be a positive number");
        }
    }

    @Override
    public MunicipalityDto createMunicipality(Municipality municipality) {
        Municipality createdMunicipality = repository.createMunicipality(municipality);
        return mapToDto(createdMunicipality);
    }

    @Override
    public MunicipalityDto updateMunicipality(Long id, Municipality updatedMunicipality) {
        Municipality existing = repository.findMunicipalityById(id)
                .orElseThrow(() -> new MunicipalityNotFoundException(id));

        existing.setName(updatedMunicipality.getName());
        existing.setRegionId(updatedMunicipality.getRegionId());

        if (updatedMunicipality.getDepartmentIds() != null) {
            existing.setDepartmentIds(new ArrayList<>(updatedMunicipality.getDepartmentIds()));
        } else {
            existing.setDepartmentIds(new ArrayList<>());
        }

        Municipality createdMunicipality = repository.createMunicipality(existing);
        return mapToDto(createdMunicipality);
    }

    @Override
    public void deleteMunicipality(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Municipality not found with id: " + id);
        }
        repository.deleteMunicipality(id);
    }

    public List<DepartmentDto> getDepartmentsOfMunicipality(Long municipalityId) {
        Municipality municipality = repository.findMunicipalityById(municipalityId)
                .orElseThrow(() -> new MunicipalityNotFoundException(municipalityId));
        return departmentClient.getDepartmentsByMunicipality(municipality.getMunicipalityId());
    }

    private MunicipalityDto mapToDto(Municipality municipality) {
        return new MunicipalityDto(
                municipality.getMunicipalityId(),
                municipality.getRegionId(),
                municipality.getName(),
                municipality.getDepartmentIds() != null
                        ? List.copyOf(municipality.getDepartmentIds())
                        : List.of()
        );
    }
}
