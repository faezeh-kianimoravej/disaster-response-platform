package nl.saxion.disaster.resourceservice.dto;

/**
 * Lightweight DTO representing the geographic location of an incident.
 * <p>
 * Exposed by <b>incident-service</b> and consumed by <b>resource-service</b>
 * when calculating distance or filtering available resources for an incident.
 * </p>
 * Contains only essential location data (latitude and longitude)
 * to minimize payload size in inter-service communication.
 */
public record IncidentLocationDto(

        Double latitude,
        Double longitude
) {
}
