package nl.saxion.disaster.departmentservice.fixtures;

import nl.saxion.disaster.departmentservice.model.entity.Department;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Test data builder for Department entities.
 * 
 * Provides a fluent API for creating test departments with sensible defaults
 * and the ability to override specific fields for test scenarios.
 * 
 * Usage:
 * <pre>
 * Department department = DepartmentTestBuilder.aDepartment()
 *     .withName("Fire Department")
 *     .withMunicipalityId(5L)
 *     .build();
 * </pre>
 */
public class DepartmentTestBuilder {

    private Long departmentId;
    private String name = "Test Department";
    private Long municipalityId = 1L;
    private byte[] image = null;
    private List<Long> resourceIds = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    private DepartmentTestBuilder() {
    }

    public static DepartmentTestBuilder aDepartment() {
        return new DepartmentTestBuilder();
    }

    public DepartmentTestBuilder withDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
        return this;
    }

    public DepartmentTestBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public DepartmentTestBuilder withMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
        return this;
    }

    public DepartmentTestBuilder withImage(byte[] image) {
        this.image = image;
        return this;
    }

    public DepartmentTestBuilder withResourceIds(List<Long> resourceIds) {
        this.resourceIds = resourceIds;
        return this;
    }

    public Department build() {
        return Department.builder()
                .departmentId(departmentId)
                .name(name)
                .municipalityId(municipalityId)
                .image(image)
                .resourceIds(resourceIds)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }

    /**
     * Builds and returns a JSON payload string for REST API testing.
     */
    public String buildAsJsonPayload() {
        StringBuilder resourcesJson = new StringBuilder("[");
        for (int i = 0; i < resourceIds.size(); i++) {
            resourcesJson.append(resourceIds.get(i));
            if (i < resourceIds.size() - 1) {
                resourcesJson.append(",");
            }
        }
        resourcesJson.append("]");

        return String.format("""
            {
              "name": "%s",
              "municipalityId": %d,
              "image": %s,
              "resources": []
            }
            """,
            escapeJson(name),
            municipalityId,
            image == null ? "null" : "\"" + escapeJson(new String(image)) + "\""
        );
    }

    /**
     * Escapes special characters in JSON strings.
     */
    private String escapeJson(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
