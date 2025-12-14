package nl.saxion.disaster.resourceservice.fixtures;

import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceCategory;
import nl.saxion.disaster.resourceservice.model.enums.ResourceKind;
import nl.saxion.disaster.resourceservice.model.enums.ResourceStatus;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;

import java.time.LocalDateTime;

/**
 * Test data builder for Resource entities.
 * 
 * Provides a fluent API for creating test resources with sensible defaults
 * and the ability to override specific fields for test scenarios.
 * 
 * Usage:
 * <pre>
 * Resource resource = ResourceTestBuilder.aResource()
 *     .withName("Fire Truck 1")
 *     .withResourceType(ResourceType.FIRE_TRUCK)
 *     .build();
 * </pre>
 */
public class ResourceTestBuilder {

    private Long resourceId;
    private Long departmentId = 1L;
    private String name = "Test Resource";
    private String description = "Test resource description";
    private Integer totalQuantity = 10;
    private Integer availableQuantity = 10;
    private ResourceType resourceType = ResourceType.FIRE_TRUCK;
    private ResourceCategory category = ResourceCategory.VEHICLE;
    private ResourceKind resourceKind = ResourceKind.UNIQUE;
    private ResourceStatus status = ResourceStatus.AVAILABLE;
    private String unit = "units";
    private Boolean isTrackable = true;
    private Double latitude = 52.0;
    private Double longitude = 5.0;
    private LocalDateTime lastLocationUpdate = LocalDateTime.now();
    private Long currentDeploymentId;
    private Integer deployedQuantity = 0;
    private byte[] image;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    private ResourceTestBuilder() {
    }

    public static ResourceTestBuilder aResource() {
        return new ResourceTestBuilder();
    }

    public ResourceTestBuilder withResourceId(Long resourceId) {
        this.resourceId = resourceId;
        return this;
    }

    public ResourceTestBuilder withDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
        return this;
    }

    public ResourceTestBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public ResourceTestBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    public ResourceTestBuilder withTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
        return this;
    }

    public ResourceTestBuilder withAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
        return this;
    }

    public ResourceTestBuilder withResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
        return this;
    }

    public ResourceTestBuilder withCategory(ResourceCategory category) {
        this.category = category;
        return this;
    }

    public ResourceTestBuilder withResourceKind(ResourceKind resourceKind) {
        this.resourceKind = resourceKind;
        return this;
    }

    public ResourceTestBuilder withStatus(ResourceStatus status) {
        this.status = status;
        return this;
    }

    public ResourceTestBuilder withUnit(String unit) {
        this.unit = unit;
        return this;
    }

    public ResourceTestBuilder withIsTrackable(Boolean isTrackable) {
        this.isTrackable = isTrackable;
        return this;
    }

    public ResourceTestBuilder withLatitude(Double latitude) {
        this.latitude = latitude;
        return this;
    }

    public ResourceTestBuilder withLongitude(Double longitude) {
        this.longitude = longitude;
        return this;
    }

    public ResourceTestBuilder withLastLocationUpdate(LocalDateTime lastLocationUpdate) {
        this.lastLocationUpdate = lastLocationUpdate;
        return this;
    }

    public ResourceTestBuilder withCurrentDeploymentId(Long currentDeploymentId) {
        this.currentDeploymentId = currentDeploymentId;
        return this;
    }

    public ResourceTestBuilder withDeployedQuantity(Integer deployedQuantity) {
        this.deployedQuantity = deployedQuantity;
        return this;
    }

    public ResourceTestBuilder withImage(byte[] image) {
        this.image = image;
        return this;
    }

    public Resource build() {
        return Resource.builder()
                .resourceId(resourceId)
                .departmentId(departmentId)
                .name(name)
                .description(description)
                .totalQuantity(totalQuantity)
                .availableQuantity(availableQuantity)
                .resourceType(resourceType)
                .category(category)
                .resourceKind(resourceKind)
                .status(status)
                .unit(unit)
                .isTrackable(isTrackable)
                .latitude(latitude)
                .longitude(longitude)
                .lastLocationUpdate(lastLocationUpdate)
                .currentDeploymentId(currentDeploymentId)
                .deployedQuantity(deployedQuantity)
                .image(image)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }

    /**
     * Builds and returns a JSON payload string for REST API testing.
     */
    public String buildAsJsonPayload() {
        return String.format("""
            {
              "departmentId": %s,
              "name": "%s",
              "description": "%s",
              "totalQuantity": %d,
              "availableQuantity": %d,
              "resourceType": "%s",
              "category": "%s",
              "resourceKind": "%s",
              "status": "%s",
              "unit": "%s",
              "isTrackable": %b,
              "latitude": %s,
              "longitude": %s
            }
            """,
            departmentId,
            escapeJson(name),
            escapeJson(description),
            totalQuantity,
            availableQuantity,
            resourceType,
            category,
            resourceKind,
            status,
            escapeJson(unit),
            isTrackable,
            latitude,
            longitude
        );
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
