package nl.saxion.disaster.shared.event;

import lombok.Builder;


@Builder
public record IncidentEvent(
        Long notificationId,
        Long incidentId,
        Long regionId,
        String incidentTitle,
        String incidentDescription
) {
}