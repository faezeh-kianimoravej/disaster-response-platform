package nl.saxion.disaster.regionservice.integration;

import jakarta.persistence.EntityManager;
import nl.saxion.disaster.regionservice.client.MunicipalityClient;
import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.dto.RegionSummaryDto;
import nl.saxion.disaster.regionservice.model.Region;
import nl.saxion.disaster.regionservice.repository.contract.RegionRepository;
import nl.saxion.disaster.regionservice.service.RegionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Disabled("Temporarily disabled until all services are integrated")
class RegionServiceIntegrationTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private RegionServiceImpl regionService;

    @Autowired

    private MunicipalityClient municipalityClient;

    private Region overijssel;

    @BeforeEach
    void setup() {
        // Clear existing data
        entityManager.createQuery("DELETE FROM Region").executeUpdate();

        // Reset sequence
        try {
            String seqName = (String) entityManager.createNativeQuery("""
                        SELECT pg_get_serial_sequence('region', 'region_id');
                    """).getSingleResult();

            if (seqName != null) {
                entityManager.createNativeQuery("ALTER SEQUENCE " + seqName + " RESTART WITH 1").executeUpdate();
                 // Silenced test output
            } else {
                 // Silenced test output
            }
        } catch (Exception e) {
              // Silenced test output
        }

        // Create test data
        overijssel = new Region();
        overijssel.setName("Overijssel");
        overijssel.setImage("testImageData".getBytes());

        overijssel = regionRepository.createRegion(overijssel);
    }

    @Test
    void whenCreateRegion_thenShouldBePersisted() {
        // Act
        List<Region> all = regionRepository.findAllRegions();

        // Assert
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getName()).isEqualTo("Overijssel");
        assertThat(all.get(0).getImage()).isEqualTo("testImageData");
    }

    @Test
    void whenGetAllRegions_thenShouldReturnSummaries() {
        // Act
        List<RegionSummaryDto> result = regionService.getAllRegions();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Overijssel");
        assertThat(result.get(0).image()).isEqualTo("testImageData");
    }

    @Test
    void whenGetRegionById_thenShouldReturnFullDto() {
        // Arrange
        List<MunicipalityDto> mockMunicipalities = List.of(
                new MunicipalityDto(1L, overijssel.getRegionId(), "Deventer", null),
                new MunicipalityDto(2L, overijssel.getRegionId(), "Enschede", null)
        );
        when(municipalityClient.getMunicipalitiesByRegion(overijssel.getRegionId())).thenReturn(mockMunicipalities);

        // Act
        RegionDto result = regionService.getRegionById(overijssel.getRegionId());

        // Assert
        assertThat(result.name()).isEqualTo("Overijssel");
        assertThat(result.municipalities()).hasSize(2);
        assertThat(result.municipalities().get(0).name()).isEqualTo("Deventer");
    }

    @Test
    void whenUpdateRegion_thenShouldReflectChanges() {
        // Arrange
        RegionDto updateDto = new RegionDto(
                overijssel.getRegionId(),
                "Updated Overijssel",
                "newImageData",
                Collections.emptyList()
        );

        // Act
        RegionDto result = regionService.updateRegion(overijssel.getRegionId(), updateDto);

        // Assert
        assertThat(result.name()).isEqualTo("Updated Overijssel");
        assertThat(result.image()).isEqualTo("newImageData");

        // Verify persistence
        Region fromDb = regionRepository.findRegionById(overijssel.getRegionId()).orElseThrow();
        assertThat(fromDb.getName()).isEqualTo("Updated Overijssel");
    }

    @Test
    void whenDeleteRegion_thenShouldBeRemoved() {
        // Arrange
        Long regionId = overijssel.getRegionId();

        // Act
        regionService.deleteRegion(regionId);

        // Assert
        List<Region> all = regionRepository.findAllRegions();
        assertThat(all).isEmpty();
        assertThat(regionRepository.findRegionById(regionId)).isEmpty();
    }

    @Test
    void whenDeleteNonExistentRegion_thenShouldThrowException() {
        // Act & Assert
        assertThrows(RuntimeException.class, () -> regionService.deleteRegion(999L));
    }

    @Test
    void whenUpdateNonExistentRegion_thenShouldThrowException() {
        // Arrange
        RegionDto updateDto = new RegionDto(999L, "Non-existent", "image", Collections.emptyList());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> regionService.updateRegion(999L, updateDto));
    }

    @Test
    void whenGetAllMunicipalitiesOfRegion_thenShouldReturnMunicipalities() {
        // Arrange
        List<MunicipalityDto> mockMunicipalities = List.of(
                new MunicipalityDto(1L, overijssel.getRegionId(), "Deventer", null),
                new MunicipalityDto(2L, overijssel.getRegionId(), "Enschede", null),
                new MunicipalityDto(3L, overijssel.getRegionId(), "Zwolle", null)
        );
        when(municipalityClient.getMunicipalitiesByRegion(overijssel.getRegionId())).thenReturn(mockMunicipalities);

        // Act
        List<MunicipalityDto> result = regionService.getAllMunicipalitiesOfRegion(overijssel.getRegionId());

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).name()).isEqualTo("Deventer");
        assertThat(result.get(1).name()).isEqualTo("Enschede");
        assertThat(result.get(2).name()).isEqualTo("Zwolle");
    }

    @Test
    void whenCreateMultipleRegions_thenAllShouldBePersisted() {
        // Arrange
        Region gelderland = new Region();
        gelderland.setName("Gelderland");
        gelderland.setImage("gelderlandImage".getBytes());

        Region utrecht = new Region();
        utrecht.setName("Utrecht");
        utrecht.setImage("utrechtImage".getBytes());

        // Act
        regionRepository.createRegion(gelderland);
        regionRepository.createRegion(utrecht);

        // Assert
        List<Region> all = regionRepository.findAllRegions();
        assertThat(all).hasSize(3); // Including the one from setup
        assertThat(all).extracting(Region::getName)
                .containsExactlyInAnyOrder("Overijssel", "Gelderland", "Utrecht");
    }

    @Test
    void whenImageIsNull_thenShouldHandleGracefully() {
        // Arrange
        Region noImageRegion = new Region();
        noImageRegion.setName("No Image Region");
        noImageRegion.setImage(null);

        // Act
        Region created = regionRepository.createRegion(noImageRegion);

        // Assert
        assertThat(created.getName()).isEqualTo("No Image Region");
        assertThat(created.getImage()).isNull();
    }
}
