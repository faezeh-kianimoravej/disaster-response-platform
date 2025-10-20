package nl.saxion.disaster.regionservice.service;

import nl.saxion.disaster.regionservice.client.MunicipalityClient;
import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.dto.RegionSummaryDto;
import nl.saxion.disaster.regionservice.mapper.RegionMapper;
import nl.saxion.disaster.regionservice.model.Region;
import nl.saxion.disaster.regionservice.repository.contract.RegionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class RegionServiceImplTest {

    @Mock
    private RegionRepository regionRepository;

    @Mock
    private MunicipalityClient municipalityClient;

    @Mock
    private RegionMapper regionMapper;

    @InjectMocks
    private RegionServiceImpl regionService;

    private Region sampleRegion;
    private RegionDto sampleDto;
    private RegionSummaryDto sampleSummaryDto;
    private List<MunicipalityDto> sampleMunicipalities;

    @BeforeEach
    void setup() {
        sampleRegion = new Region();
        sampleRegion.setRegionId(1L);
        sampleRegion.setName("Overijssel");
        sampleRegion.setImage("base64ImageData".getBytes());

        sampleDto = new RegionDto(
                1L,
                "Overijssel",
                "base64ImageData",
                Collections.emptyList()
        );

        sampleSummaryDto = new RegionSummaryDto(
                1L,
                "Overijssel",
                "base64ImageData"
        );

        sampleMunicipalities = List.of(
                new MunicipalityDto(10L, 1L, "Deventer", null),
                new MunicipalityDto(11L, 1L, "Enschede", null)
        );
    }

    @Test
    void getAllRegions_shouldReturnSummaryDtoList() {
        // Arrange
        when(regionRepository.findAllRegions()).thenReturn(List.of(sampleRegion));
        when(regionMapper.toSummaryDto(sampleRegion)).thenReturn(sampleSummaryDto);

        // Act
        List<RegionSummaryDto> result = regionService.getAllRegions();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Overijssel");
        assertThat(result.get(0).regionId()).isEqualTo(1L);
        verify(regionRepository).findAllRegions();
        verify(regionMapper).toSummaryDto(sampleRegion);
        verifyNoInteractions(municipalityClient); // Summary should not fetch nested data
    }

    @Test
    void getAllRegions_shouldReturnEmptyList_whenNoRegions() {
        // Arrange
        when(regionRepository.findAllRegions()).thenReturn(Collections.emptyList());

        // Act
        List<RegionSummaryDto> result = regionService.getAllRegions();

        // Assert
        assertThat(result).isEmpty();
        verify(regionRepository).findAllRegions();
        verifyNoMoreInteractions(regionMapper);
    }

    @Test
    void getRegionById_shouldReturnDtoWithMunicipalities_whenExists() {
        // Arrange
        when(regionRepository.findRegionById(1L)).thenReturn(Optional.of(sampleRegion));
        when(regionMapper.toDto(sampleRegion)).thenReturn(sampleDto);
        when(municipalityClient.getMunicipalitiesByRegion(1L)).thenReturn(sampleMunicipalities);

        // Act
        RegionDto result = regionService.getRegionById(1L);

        // Assert
        assertThat(result.name()).isEqualTo("Overijssel");
        assertThat(result.regionId()).isEqualTo(1L);
        assertThat(result.municipalities()).hasSize(2);
        assertThat(result.municipalities().get(0).name()).isEqualTo("Deventer");
        verify(regionRepository).findRegionById(1L);
        verify(regionMapper).toDto(sampleRegion);
        verify(municipalityClient).getMunicipalitiesByRegion(1L);
    }

    @Test
    void getRegionById_shouldReturnEmptyDto_whenNotFound() {
        // Arrange
        when(regionRepository.findRegionById(99L)).thenReturn(Optional.empty());

        // Act
        RegionDto result = regionService.getRegionById(99L);

        // Assert
        assertThat(result.regionId()).isEqualTo(0L);
        assertThat(result.name()).isEmpty();
        assertThat(result.municipalities()).isEmpty();
        verify(regionRepository).findRegionById(99L);
        verifyNoInteractions(regionMapper);
        verifyNoInteractions(municipalityClient);
    }

    @Test
    void getRegionById_shouldHandleNullMunicipalities() {
        // Arrange
        when(regionRepository.findRegionById(1L)).thenReturn(Optional.of(sampleRegion));
        when(regionMapper.toDto(sampleRegion)).thenReturn(sampleDto);
        when(municipalityClient.getMunicipalitiesByRegion(1L)).thenReturn(null);

        // Act
        RegionDto result = regionService.getRegionById(1L);

        // Assert - municipalities should still be empty list from initial DTO
        assertThat(result).isNotNull();
        verify(municipalityClient).getMunicipalitiesByRegion(1L);
    }

    @Test
    void createRegion_shouldReturnCreatedDto() {
        // Arrange
        Region entityToCreate = new Region();
        entityToCreate.setName("Gelderland");
        entityToCreate.setImage("newImageData".getBytes());

        Region createdEntity = new Region();
        createdEntity.setRegionId(2L);
        createdEntity.setName("Gelderland");
        createdEntity.setImage("newImageData".getBytes());

        RegionDto inputDto = new RegionDto(null, "Gelderland", "newImageData", Collections.emptyList());
        RegionDto outputDto = new RegionDto(2L, "Gelderland", "newImageData", Collections.emptyList());

        when(regionMapper.toEntity(inputDto)).thenReturn(entityToCreate);
        when(regionRepository.createRegion(entityToCreate)).thenReturn(createdEntity);
        when(regionMapper.toDto(createdEntity)).thenReturn(outputDto);

        // Act
        RegionDto result = regionService.createRegion(inputDto);

        // Assert
        assertThat(result.regionId()).isEqualTo(2L);
        assertThat(result.name()).isEqualTo("Gelderland");
        verify(regionMapper).toEntity(inputDto);
        verify(regionRepository).createRegion(entityToCreate);
        verify(regionMapper).toDto(createdEntity);
    }

    @Test
    void updateRegion_shouldUpdateAndReturnDto() {
        // Arrange
        RegionDto updateDto = new RegionDto(1L, "Updated Overijssel", "updatedImage", Collections.emptyList());
        
        Region updateEntity = new Region();
        updateEntity.setName("Updated Overijssel");
        updateEntity.setImage("updatedImage".getBytes());

        Region updatedEntity = new Region();
        updatedEntity.setRegionId(1L);
        updatedEntity.setName("Updated Overijssel");
        updatedEntity.setImage("updatedImage".getBytes());

        RegionDto outputDto = new RegionDto(1L, "Updated Overijssel", "updatedImage", Collections.emptyList());

        when(regionRepository.findRegionById(1L)).thenReturn(Optional.of(sampleRegion));
        when(regionMapper.toEntity(updateDto)).thenReturn(updateEntity);
        when(regionRepository.updateRegion(any(Region.class))).thenReturn(updatedEntity);
        when(regionMapper.toDto(updatedEntity)).thenReturn(outputDto);

        // Act
        RegionDto result = regionService.updateRegion(1L, updateDto);

        // Assert
        assertThat(result.name()).isEqualTo("Updated Overijssel");
        assertThat(result.image()).isEqualTo("updatedImage");
        verify(regionRepository).findRegionById(1L);
        verify(regionMapper).toEntity(updateDto);
        verify(regionRepository).updateRegion(any(Region.class));
        verify(regionMapper).toDto(updatedEntity);
    }

    @Test
    void updateRegion_shouldThrowException_whenNotFound() {
        // Arrange
        RegionDto updateDto = new RegionDto(99L, "Non-existent", "image", Collections.emptyList());
        when(regionRepository.findRegionById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> regionService.updateRegion(99L, updateDto));
        verify(regionRepository).findRegionById(99L);
        verifyNoInteractions(regionMapper);
        verify(regionRepository, never()).updateRegion(any());
    }

    @Test
    void deleteRegion_shouldDeleteSuccessfully_whenExists() {
        // Arrange
        when(regionRepository.findRegionById(1L)).thenReturn(Optional.of(sampleRegion));

        // Act
        regionService.deleteRegion(1L);

        // Assert
        verify(regionRepository).findRegionById(1L);
        verify(regionRepository).deleteRegionById(1L);
    }

    @Test
    void deleteRegion_shouldThrowException_whenNotFound() {
        // Arrange
        when(regionRepository.findRegionById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> regionService.deleteRegion(99L));
        verify(regionRepository).findRegionById(99L);
        verify(regionRepository, never()).deleteRegionById(anyLong());
    }

    @Test
    void getAllMunicipalitiesOfRegion_shouldReturnMunicipalities() {
        // Arrange
        when(municipalityClient.getMunicipalitiesByRegion(1L)).thenReturn(sampleMunicipalities);

        // Act
        List<MunicipalityDto> result = regionService.getAllMunicipalitiesOfRegion(1L);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("Deventer");
        assertThat(result.get(1).name()).isEqualTo("Enschede");
        verify(municipalityClient).getMunicipalitiesByRegion(1L);
    }

    @Test
    void getAllMunicipalitiesOfRegion_shouldReturnEmptyList_whenNull() {
        // Arrange
        when(municipalityClient.getMunicipalitiesByRegion(1L)).thenReturn(null);

        // Act
        List<MunicipalityDto> result = regionService.getAllMunicipalitiesOfRegion(1L);

        // Assert
        assertThat(result).isEmpty();
        verify(municipalityClient).getMunicipalitiesByRegion(1L);
    }

    @Test
    void getAllMunicipalitiesOfRegion_shouldReturnEmptyList_whenEmpty() {
        // Arrange
        when(municipalityClient.getMunicipalitiesByRegion(1L)).thenReturn(Collections.emptyList());

        // Act
        List<MunicipalityDto> result = regionService.getAllMunicipalitiesOfRegion(1L);

        // Assert
        assertThat(result).isEmpty();
        verify(municipalityClient).getMunicipalitiesByRegion(1L);
    }
}
