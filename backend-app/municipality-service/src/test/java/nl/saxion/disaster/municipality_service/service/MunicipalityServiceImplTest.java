package nl.saxion.disaster.municipality_service.service;

import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
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
                List.of(100L, 101L)
        );
    }

    @Test
    void getAllMunicipalities_shouldReturnDtoList() {
        when(repository.findAllMunicipality()).thenReturn(List.of(sampleMunicipality));
        when(mapper.toDto(sampleMunicipality)).thenReturn(sampleDto);

        List<MunicipalityDto> result = service.getAllMunicipalities();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Deventer");
        verify(repository).findAllMunicipality();
        verify(mapper).toDto(sampleMunicipality);
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

        MunicipalityDto updatedDto = new MunicipalityDto(
                1L, 22L, "Updated Deventer", null, List.of(200L)
        );

        when(repository.findMunicipalityById(1L)).thenReturn(Optional.of(sampleMunicipality));
        when(repository.createMunicipality(any())).thenReturn(updatedEntity);
        when(mapper.toDto(updatedEntity)).thenReturn(updatedDto);

        MunicipalityDto result = service.updateMunicipality(1L, updated);

        assertThat(result.name()).isEqualTo("Updated Deventer");
        assertThat(result.regionId()).isEqualTo(22L);
        verify(repository).findMunicipalityById(1L);
        verify(repository).createMunicipality(any());
        verify(mapper).toDto(updatedEntity);
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
                .thenReturn(List.of(new DepartmentDto(1L, 1L, 1L, "Fire Department", List.of())));

        List<DepartmentDto> result = service.getDepartmentsOfMunicipality(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).departmentName()).isEqualTo("Fire Department");
        verify(departmentClient).getDepartmentsByMunicipality(1L);
    }
}
