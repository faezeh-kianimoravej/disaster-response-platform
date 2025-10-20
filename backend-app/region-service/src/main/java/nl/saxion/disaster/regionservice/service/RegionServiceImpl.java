package nl.saxion.disaster.regionservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.regionservice.client.MunicipalityClient;
import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.dto.RegionSummaryDto;
import nl.saxion.disaster.regionservice.mapper.RegionMapper;
import nl.saxion.disaster.regionservice.model.Region;
import nl.saxion.disaster.regionservice.repository.contract.RegionRepository;
import nl.saxion.disaster.regionservice.service.contract.RegionService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionServiceImpl implements RegionService {

    private final RegionRepository regionRepository;
    private final RegionMapper regionMapper;
    private final MunicipalityClient municipalityClient;

    /**
     * Get all regions - returns simplified DTO without nested municipalities.
     * This prevents deep nesting in collection responses.
     */
    @Override
    public List<RegionSummaryDto> getAllRegions() {
        return regionRepository.findAllRegions()
                .stream()
                .map(regionMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    /**
     * Get single region by ID - returns full DTO with nested municipalities.
     * This provides complete details for individual resource requests.
     */
    @Override
    public RegionDto getRegionById(Long regionId) {
        Optional<Region> regionOptional = regionRepository.findRegionById(regionId);
        if (regionOptional.isEmpty()) {
            return new RegionDto(0L, "", "", Collections.emptyList());
        }

        Region region = regionOptional.get();
        RegionDto dto = regionMapper.toDto(region);
        List<MunicipalityDto> municipalites = municipalityClient.getMunicipalitiesByRegion(regionId);

        return new RegionDto(dto.regionId(), dto.name(), dto.image(), municipalites);
    }

    @Override
    public RegionDto createRegion(RegionDto regionDto) {
        Region entity = regionMapper.toEntity(regionDto);
        Region savedRegion = regionRepository.createRegion(entity);
        return regionMapper.toDto(savedRegion);
    }

    @Override
    public RegionDto updateRegion(Long regionId, RegionDto regionDto) {
        Optional<Region> existingRegion = regionRepository.findRegionById(regionId);
        if (existingRegion.isEmpty()) {
            throw new RuntimeException("Region not found with id: " + regionId);
        }

        Region entity = regionMapper.toEntity(regionDto);
        entity.setRegionId(regionId); // Ensure we're updating the correct region
        Region updatedRegion = regionRepository.updateRegion(entity);
        return regionMapper.toDto(updatedRegion);
    }

    @Override
    public void deleteRegion(Long regionId) {
        Optional<Region> existingRegion = regionRepository.findRegionById(regionId);
        if (existingRegion.isEmpty()) {
            throw new RuntimeException("Region not found with id: " + regionId);
        }
        regionRepository.deleteRegionById(regionId);
    }

    @Override
    public List<MunicipalityDto> getAllMunicipalitiesOfRegion(Long regionId) {
        List<MunicipalityDto> municipalities = municipalityClient.getMunicipalitiesByRegion(regionId);
        return municipalities != null ? municipalities : Collections.emptyList();
    }
}
