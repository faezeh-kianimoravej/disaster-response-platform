package nl.saxion.disaster.regionservice.fixtures;

import nl.saxion.disaster.regionservice.model.Region;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Test data builder for Region entities.
 * 
 * Provides a fluent API for creating test regions with sensible defaults
 * and the ability to override specific fields for test scenarios.
 * 
 * Usage:
 * <pre>
 * Region region = RegionTestBuilder.aRegion()
 *     .withName("Noord-Nederland")
 *     .withMunicipalityIds(List.of(1L, 2L))
 *     .build();
 * </pre>
 */
public class RegionTestBuilder {

    private Long regionId;
    private String name = "Test Region";
    private byte[] image = null;
    private List<Long> municipalityIds = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    private RegionTestBuilder() {
    }

    public static RegionTestBuilder aRegion() {
        return new RegionTestBuilder();
    }

    public RegionTestBuilder withRegionId(Long regionId) {
        this.regionId = regionId;
        return this;
    }

    public RegionTestBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public RegionTestBuilder withImage(byte[] image) {
        this.image = image;
        return this;
    }

    public RegionTestBuilder withMunicipalityIds(List<Long> municipalityIds) {
        this.municipalityIds = municipalityIds;
        return this;
    }

    public RegionTestBuilder withCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public RegionTestBuilder withUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    public Region build() {
        Region region = new Region();
        region.setRegionId(regionId);
        region.setName(name);
        region.setImage(image);
        region.setMunicipalityIds(municipalityIds);
        region.setCreatedAt(createdAt);
        region.setUpdatedAt(updatedAt);
        return region;
    }

    /**
     * Builds and returns a JSON payload string for REST API testing.
     */
    public String buildAsJsonPayload() {
        StringBuilder municipalityIdsJson = new StringBuilder("[");
        if (municipalityIds != null && !municipalityIds.isEmpty()) {
            for (int i = 0; i < municipalityIds.size(); i++) {
                municipalityIdsJson.append(municipalityIds.get(i));
                if (i < municipalityIds.size() - 1) {
                    municipalityIdsJson.append(", ");
                }
            }
        }
        municipalityIdsJson.append("]");

        return String.format("""
            {
              "name": "%s",
              "municipalityIds": %s
            }
            """,
            escapeJson(name),
            municipalityIdsJson
        );
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
