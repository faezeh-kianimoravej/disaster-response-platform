package nl.saxion.disaster.municipality_service.integration;

import jakarta.persistence.EntityManager;
import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.model.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.model.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.repository.contract.MunicipalityRepository;
import nl.saxion.disaster.municipality_service.service.MunicipalityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;


@SpringBootTest
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MunicipalityServiceIntegrationTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private MunicipalityRepository repository;

    @Autowired
    private MunicipalityServiceImpl service;

    @MockBean
    private DepartmentClient departmentClient;

    private Municipality deventer;

    @BeforeEach
    void setup() {
        entityManager.createQuery("DELETE FROM Municipality").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE municipality ALTER COLUMN municipality_id RESTART WITH 1").executeUpdate();

        deventer = Municipality.builder()
                .name("Deventer")
                .regionId(1L)
                .departmentIds(List.of(10L, 11L))
                .build();

        repository.createMunicipality(deventer);
    }

    @Test
    void whenCreateMunicipality_thenShouldBePersisted() {
        List<Municipality> all = repository.findAllMunicipality();
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getName()).isEqualTo("Deventer");
    }

    @Test
    void whenUpdateMunicipality_thenShouldReflectChanges() {

        if (deventer.getDepartmentIds() != null) {
            deventer.setDepartmentIds(new ArrayList<>(deventer.getDepartmentIds()));
        } else {
            deventer.setDepartmentIds(new ArrayList<>());
        }

        deventer.setName("Updated Deventer");
        repository.updateMunicipality(deventer);

        Municipality updated = repository.findMunicipalityById(deventer.getMunicipalityId()).get();
        assertThat(updated.getName()).isEqualTo("Updated Deventer");
    }

    @Test
    void whenDeleteMunicipality_thenItShouldBeRemoved() {
        repository.deleteMunicipality(deventer.getMunicipalityId());
        assertThat(repository.findMunicipalityById(deventer.getMunicipalityId())).isEmpty();
    }

    @Test
    void whenGetMunicipalityById_thenDtoMatches() {
        MunicipalityDto dto = service.getMunicipalityById(deventer.getMunicipalityId());
        assertThat(dto.name()).isEqualTo("Deventer");
        assertThat(dto.departmentIds()).containsExactly(10L, 11L);
    }

    @Test
    void whenGetDepartmentsOfMunicipality_thenFeignClientIsCalled() {
        when(departmentClient.getDepartmentsByMunicipality(deventer.getMunicipalityId()))
                .thenReturn(List.of(
                        new DepartmentDto(1L, 1L, 1L, "Fire Department", List.of())
                ));

        List<DepartmentDto> departments = service.getDepartmentsOfMunicipality(deventer.getMunicipalityId());

        assertThat(departments).hasSize(1);
        assertThat(departments.get(0).departmentName()).isEqualTo("Fire Department");
    }
}