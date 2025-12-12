package nl.saxion.disaster.municipality_service.fixtures;

import nl.saxion.disaster.municipality_service.model.entity.Municipality;

import java.time.LocalDateTime;

/**
 * Test data builder for Municipality entities.
 * 
 * Provides a fluent API for creating test municipalities with sensible defaults
 * and the ability to override specific fields for test scenarios.
 * 
 * Usage:
 * <pre>
 * Municipality municipality = MunicipalityTestBuilder.aMunicipality()
 *     .withName("Amsterdam")
 *     .withRegionId(1L)
 *     .build();
 * </pre>
 */
public class MunicipalityTestBuilder {

    private Long municipalityId;
    private String name = "Test Municipality";
    private Long regionId = 1L;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    private MunicipalityTestBuilder() {
    }

    public static MunicipalityTestBuilder aMunicipality() {
        return new MunicipalityTestBuilder();
    }

    public MunicipalityTestBuilder withMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
        return this;
    }

    public MunicipalityTestBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public MunicipalityTestBuilder withRegionId(Long regionId) {
        this.regionId = regionId;
        return this;
    }

    public MunicipalityTestBuilder withCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public MunicipalityTestBuilder withUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    public Municipality build() {
        Municipality municipality = new Municipality();
        municipality.setMunicipalityId(municipalityId);
        municipality.setName(name);
        municipality.setRegionId(regionId);
        municipality.setCreatedAt(createdAt);
        municipality.setUpdatedAt(updatedAt);
        return municipality;
    }

    /**
     * Builds and returns a JSON payload string for REST API testing.
     */
    public String buildAsJsonPayload() {
        return String.format("""
            {
              "name": "%s",
              "regionId": %d
            }
            """,
            escapeJson(name),
            regionId
        );
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
