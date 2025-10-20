package nl.saxion.disaster.municipality_service.integration;

import jakarta.persistence.EntityManager;
import nl.saxion.disaster.municipality_service.client.DepartmentClient;
import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.mapper.MunicipalityMapper;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.repository.contract.MunicipalityRepository;
import nl.saxion.disaster.municipality_service.service.MunicipalityServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
@ActiveProfiles("test") // uses application-test.properties for PostgreSQL
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Disabled("Temporarily disabled until all services are integrated")
class MunicipalityServiceIntegrationTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private MunicipalityRepository repository;

    @Autowired
    private MunicipalityServiceImpl service;

    @Autowired
    private MunicipalityMapper mapper;

    @MockBean
    private DepartmentClient departmentClient;

    private Municipality deventer;

    @BeforeEach
    void setup() {
        entityManager.createQuery("DELETE FROM Municipality").executeUpdate();

        try {
            String seqName = (String) entityManager.createNativeQuery("""
                        SELECT pg_get_serial_sequence('municipality', 'municipality_id');
                    """).getSingleResult();

            if (seqName != null) {
                entityManager.createNativeQuery("ALTER SEQUENCE " + seqName + " RESTART WITH 1").executeUpdate();
                System.out.println("✅ Sequence " + seqName + " restarted successfully.");
            } else {
                System.out.println("⚠️ No sequence found for municipality_id — maybe using IDENTITY strategy.");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not reset sequence: " + e.getMessage());
        }

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

        Municipality updated = repository.findMunicipalityById(deventer.getMunicipalityId()).orElseThrow();
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
        assertThat(dto.departments()).hasSize(2);
    }

    @Test
    void whenGetDepartmentsOfMunicipality_thenFeignClientIsCalled() {
        when(departmentClient.getDepartmentsByMunicipality(deventer.getMunicipalityId()))
                .thenReturn(List.of(
                        new DepartmentSummaryDto(1L, deventer.getMunicipalityId(), 1L, "Fire Department", null)
                ));

        List<DepartmentSummaryDto> departments = service.getDepartmentsOfMunicipality(deventer.getMunicipalityId());

        assertThat(departments).hasSize(1);
        assertThat(departments.get(0).name()).isEqualTo("Fire Department");
    }
}
