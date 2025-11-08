package nl.saxion.disaster.municipality_service.service;

import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalitySummaryDto;
import nl.saxion.disaster.municipality_service.exception.MunicipalityNotFoundException;
import nl.saxion.disaster.municipality_service.mapper.MunicipalityMapper;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.repository.contract.MunicipalityRepository;
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
class MunicipalityServiceImplTest {

    @Mock
    private MunicipalityRepository repository;

    @Mock
    private DepartmentClient departmentClient;

    @Mock
    private MunicipalityMapper mapper;

    @InjectMocks
    private MunicipalityServiceImpl service;

    private Municipality sampleMunicipality;
    private MunicipalityDto sampleDto;

    @BeforeEach
    void setup() {
        sampleMunicipality = Municipality.builder()
                .municipalityId(1L)
                .name("Deventer")
                .regionId(10L)
                .departmentIds(List.of(100L, 101L))
                .build();

        sampleDto = new MunicipalityDto(
                1L,
                10L,
                "Deventer",
                null,
                List.of(
                        new DepartmentSummaryDto(100L, 1L, 10L, "Dept 1", null),
                        new DepartmentSummaryDto(101L, 1L, 10L, "Dept 2", null)
                )
        );
    }

    @Test
    void getAllMunicipalities_shouldReturnDtoList() {
        when(repository.findAllMunicipality()).thenReturn(List.of(sampleMunicipality));
        MunicipalitySummaryDto summaryDto = new MunicipalitySummaryDto(1L, 10L, "Deventer", null);
        when(mapper.toSummaryDto(sampleMunicipality)).thenReturn(summaryDto);

        List<MunicipalitySummaryDto> result = service.getAllMunicipalities();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Deventer");
        verify(repository).findAllMunicipality();
        verify(mapper).toSummaryDto(sampleMunicipality);
    }

    @Test
    void getMunicipalityById_shouldReturnDto_whenExists() {
        when(repository.findMunicipalityById(1L)).thenReturn(Optional.of(sampleMunicipality));
        when(mapper.toDto(sampleMunicipality)).thenReturn(sampleDto);

        MunicipalityDto result = service.getMunicipalityById(1L);

        assertThat(result.name()).isEqualTo("Deventer");
        verify(repository).findMunicipalityById(1L);
        verify(mapper).toDto(sampleMunicipality);
    }

    @Test
    void getMunicipalityById_shouldThrow_whenNotFound() {
        when(repository.findMunicipalityById(99L)).thenReturn(Optional.empty());

        assertThrows(MunicipalityNotFoundException.class, () -> service.getMunicipalityById(99L));

        verify(repository).findMunicipalityById(99L);
        verifyNoInteractions(mapper);
    }

    @Test
    void createMunicipality_shouldReturnDto() {
        when(repository.createMunicipality(any())).thenReturn(sampleMunicipality);
        when(mapper.toDto(sampleMunicipality)).thenReturn(sampleDto);

        MunicipalityDto result = service.createMunicipality(sampleMunicipality);

        assertThat(result.name()).isEqualTo("Deventer");
        verify(repository).createMunicipality(any());
        verify(mapper).toDto(sampleMunicipality);
    }

    @Test
    void updateMunicipality_shouldUpdateAndReturnDto() {
        Municipality updated = Municipality.builder()
                .name("Updated Deventer")
                .regionId(22L)
                .departmentIds(List.of(200L))
                .build();

        Municipality updatedEntity = Municipality.builder()
                .municipalityId(1L)
                .name("Updated Deventer")
                .regionId(22L)
                .departmentIds(List.of(200L))
                .build();

        MunicipalityDto baseDto = new MunicipalityDto(
                1L, 22L, "Updated Deventer", null, Collections.emptyList()
        );

        when(repository.findMunicipalityById(1L)).thenReturn(Optional.of(sampleMunicipality));
        when(repository.createMunicipality(any())).thenReturn(updatedEntity);
        when(mapper.toDto(updatedEntity)).thenReturn(baseDto);

        MunicipalityDto result = service.updateMunicipality(1L, updated);

        assertThat(result.name()).isEqualTo("Updated Deventer");
        assertThat(result.regionId()).isEqualTo(22L);
        verify(repository).findMunicipalityById(1L);
        verify(repository).createMunicipality(any());
    }

    @Test
    void deleteMunicipality_shouldDelete_whenExists() {
        when(repository.existsById(1L)).thenReturn(true);

        service.deleteMunicipality(1L);

        verify(repository).deleteMunicipality(1L);
    }

    @Test
    void getDepartmentsOfMunicipality_shouldCallDepartmentClient() {
        when(repository.findMunicipalityById(1L)).thenReturn(Optional.of(sampleMunicipality));
        when(departmentClient.getDepartmentsByMunicipality(1L))
                .thenReturn(List.of(new DepartmentSummaryDto(1L, 1L, 1L, "Fire Department", null)));

        List<DepartmentSummaryDto> result = service.getDepartmentsOfMunicipality(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Fire Department");
        verify(departmentClient).getDepartmentsByMunicipality(1L);
    }

    @Test
    void getMunicipalityBasicInfoById_shouldReturnBasicInfo_whenExists() {
        when(repository.findMunicipalityById(1L)).thenReturn(Optional.of(sampleMunicipality));

        var result = service.getMunicipalityBasicInfoById(1L);

        assertThat(result).isPresent();
        var dto = result.get();
        assertThat(dto.id()).isEqualTo(sampleMunicipality.getMunicipalityId());
        assertThat(dto.name()).isEqualTo(sampleMunicipality.getName());
        assertThat(dto.departmentIds()).containsExactlyElementsOf(sampleMunicipality.getDepartmentIds());
        verify(repository).findMunicipalityById(1L);
    }

    @Test
    void getMunicipalityBasicInfoById_shouldReturnEmpty_whenNotFound() {
        when(repository.findMunicipalityById(99L)).thenReturn(Optional.empty());

        var result = service.getMunicipalityBasicInfoById(99L);

        assertThat(result).isEmpty();
        verify(repository).findMunicipalityById(99L);
    }

    @Test
    void getMunicipalitySummaryListByRegionId_shouldReturnList_whenExists() {
        when(repository.findMunicipalitiesByRegionId(10L)).thenReturn(List.of(sampleMunicipality));
        MunicipalitySummaryDto summaryDto = new MunicipalitySummaryDto(1L, 10L, "Deventer", null);
        when(mapper.toSummaryDto(sampleMunicipality)).thenReturn(summaryDto);

        var result = service.getMunicipalitySummaryListByRegionId(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Deventer");
        verify(repository).findMunicipalitiesByRegionId(10L);
    }

    @Test
    void getMunicipalitySummaryListByRegionId_shouldReturnEmptyList_whenNoneFound() {
        when(repository.findMunicipalitiesByRegionId(99L)).thenReturn(Collections.emptyList());

        var result = service.getMunicipalitySummaryListByRegionId(99L);

        assertThat(result).isEmpty();
        verify(repository).findMunicipalitiesByRegionId(99L);
    }

    @Test
    void getMunicipalityDtoListByRegionId_shouldReturnList() {
        when(repository.findMunicipalitiesByRegionId(10L)).thenReturn(List.of(sampleMunicipality));
        when(mapper.toDto(sampleMunicipality)).thenReturn(sampleDto);

        var result = service.getMunicipalityDtoListByRegionId(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Deventer");
        verify(repository).findMunicipalitiesByRegionId(10L);
    }

    @Test
    void getDepartmentIdsByMunicipalityId_shouldReturnList_whenExists() {
        when(repository.findMunicipalityById(1L)).thenReturn(Optional.of(sampleMunicipality));

        var result = service.getDepartmentIdsByMunicipalityId(1L);

        assertThat(result).containsExactlyElementsOf(sampleMunicipality.getDepartmentIds());
        verify(repository).findMunicipalityById(1L);
    }

    @Test
    void getDepartmentIdsByMunicipalityId_shouldThrow404_whenNotFound() {
        when(repository.findMunicipalityById(404L)).thenReturn(Optional.empty());

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () ->
                service.getDepartmentIdsByMunicipalityId(404L)
        );

        verify(repository).findMunicipalityById(404L);
    }
}
