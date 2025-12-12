package nl.saxion.disaster.incident_service.fixtures;

import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.model.enums.GripLevel;
import nl.saxion.disaster.incident_service.model.enums.Severity;
import nl.saxion.disaster.incident_service.model.enums.Status;

import java.time.OffsetDateTime;

/**
 * Test data builder for Incident entities.
 * 
 * Provides a fluent API for creating test incidents with sensible defaults
 * and the ability to override specific fields for test scenarios.
 * 
 * Usage:
 * <pre>
 * Incident incident = IncidentTestBuilder.anIncident()
 *     .withTitle("Fire at factory")
 *     .withSeverity(Severity.HIGH)
 *     .build();
 * </pre>
 */
public class IncidentTestBuilder {

    private Long incidentId;
    private String reportedBy = "112";
    private String title = "Test Incident";
    private String description = "Test incident description";
    private Severity severity = Severity.MEDIUM;
    private GripLevel gripLevel = GripLevel.LEVEL_1;
    private Status status = Status.OPEN;
    private OffsetDateTime reportedAt = OffsetDateTime.now();
    private String location = "Test Location";
    private Double latitude = 52.0;
    private Double longitude = 5.0;
    private Long regionId = 1L;
    private OffsetDateTime createdAt = OffsetDateTime.now();
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    private IncidentTestBuilder() {
    }

    public static IncidentTestBuilder anIncident() {
        return new IncidentTestBuilder();
    }

    public IncidentTestBuilder withIncidentId(Long incidentId) {
        this.incidentId = incidentId;
        return this;
    }

    public IncidentTestBuilder withReportedBy(String reportedBy) {
        this.reportedBy = reportedBy;
        return this;
    }

    public IncidentTestBuilder withTitle(String title) {
        this.title = title;
        return this;
    }

    public IncidentTestBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    public IncidentTestBuilder withSeverity(Severity severity) {
        this.severity = severity;
        return this;
    }

    public IncidentTestBuilder withGripLevel(GripLevel gripLevel) {
        this.gripLevel = gripLevel;
        return this;
    }

    public IncidentTestBuilder withStatus(Status status) {
        this.status = status;
        return this;
    }

    public IncidentTestBuilder withReportedAt(OffsetDateTime reportedAt) {
        this.reportedAt = reportedAt;
        return this;
    }

    public IncidentTestBuilder withLocation(String location) {
        this.location = location;
        return this;
    }

    public IncidentTestBuilder withLatitude(Double latitude) {
        this.latitude = latitude;
        return this;
    }

    public IncidentTestBuilder withLongitude(Double longitude) {
        this.longitude = longitude;
        return this;
    }

    public IncidentTestBuilder withRegionId(Long regionId) {
        this.regionId = regionId;
        return this;
    }

    public Incident build() {
        return Incident.builder()
                .incidentId(incidentId)
                .reportedBy(reportedBy)
                .title(title)
                .description(description)
                .severity(severity)
                .gripLevel(gripLevel)
                .status(status)
                .reportedAt(reportedAt)
                .location(location)
                .latitude(latitude)
                .longitude(longitude)
                .regionId(regionId)
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
              "reportedBy": "%s",
              "title": "%s",
              "description": "%s",
              "severity": "%s",
              "gripLevel": "%s",
              "status": "%s",
              "reportedAt": "%s",
              "location": "%s",
              "latitude": %s,
              "longitude": %s,
              "regionId": %d
            }
            """,
            escapeJson(reportedBy),
            escapeJson(title),
            escapeJson(description),
            severity,
            gripLevel,
            status,
            reportedAt,
            location,
            latitude,
            longitude,
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
