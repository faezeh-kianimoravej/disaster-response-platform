package nl.saxion.disaster.municipality_service.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.exception.MunicipalityNotFoundException;
import nl.saxion.disaster.municipality_service.mapper.MunicipalityMapper;
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
    private final MunicipalityMapper mapper;

    @Override
    public List<MunicipalityDto> getAllMunicipalities() {
        return repository.findAllMunicipality()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MunicipalityDto getMunicipalityById(Long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("Municipality ID must be a positive number");
        }

        Municipality municipality = repository.findMunicipalityById(id)
                .orElseThrow(() -> new MunicipalityNotFoundException("Municipality not found with id: " + id));

        return mapper.toDto(municipality);
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
    public List<DepartmentDto> getDepartmentsOfMunicipality(Long municipalityId) {
        Municipality municipality = repository.findMunicipalityById(municipalityId)
                .orElseThrow(() -> new MunicipalityNotFoundException(municipalityId));

        return departmentClient.getDepartmentsByMunicipality(municipality.getMunicipalityId());
    }
}
