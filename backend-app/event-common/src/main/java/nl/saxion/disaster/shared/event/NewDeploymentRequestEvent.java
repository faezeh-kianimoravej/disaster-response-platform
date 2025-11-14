package nl.saxion.disaster.shared.event;

import lombok.Builder;

import java.time.Instant;

@Builder
public record NewDeploymentRequestEvent(
        Long deploymentRequestId,
        Long departmentId,
        Long incidentId,
        Instant createdAt
) {
}