package nl.saxion.disaster.deploymentservice.fixtures;

import nl.saxion.disaster.deploymentservice.enums.DeploymentStatus;
import nl.saxion.disaster.deploymentservice.model.Deployment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Test data builder for Deployment entities.
 * 
 * Provides a fluent API for creating test deployments with sensible defaults
 * and the ability to override specific fields for test scenarios.
 * 
 * Usage:
 * <pre>
 * Deployment deployment = DeploymentTestBuilder.aDeployment()
 *     .withIncidentId(123L)
 *     .withStatus(DeploymentStatus.ASSIGNED)
 *     .build();
 * </pre>
 */
public class DeploymentTestBuilder {

    private Long deploymentId;
    private Long incidentId = 1L;
    private Long deploymentRequestId = 1L;
    private Long responseUnitId = 1L;
    private DeploymentStatus status = DeploymentStatus.ASSIGNED;
    private Long version = 0L;
    private List<Deployment.DeployedResource> deployedResources = new ArrayList<>();
    private List<Deployment.DeployedPersonnel> deployedPersonnel = new ArrayList<>();
    private LocalDateTime orderedAt = LocalDateTime.now().minusHours(1);
    private LocalDateTime assignedAt = LocalDateTime.now();
    private LocalDateTime acknowledgedAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;
    private Double currentLatitude = 52.0;
    private Double currentLongitude = 5.0;
    private LocalDateTime estimatedArrival;
    private List<Deployment.ConsumedResource> consumedResources = new ArrayList<>();
    private String notes = "Test deployment notes";

    private DeploymentTestBuilder() {
    }

    public static DeploymentTestBuilder aDeployment() {
        return new DeploymentTestBuilder();
    }

    public DeploymentTestBuilder withDeploymentId(Long deploymentId) {
        this.deploymentId = deploymentId;
        return this;
    }

    public DeploymentTestBuilder withIncidentId(Long incidentId) {
        this.incidentId = incidentId;
        return this;
    }

    public DeploymentTestBuilder withDeploymentRequestId(Long deploymentRequestId) {
        this.deploymentRequestId = deploymentRequestId;
        return this;
    }

    public DeploymentTestBuilder withResponseUnitId(Long responseUnitId) {
        this.responseUnitId = responseUnitId;
        return this;
    }

    public DeploymentTestBuilder withStatus(DeploymentStatus status) {
        this.status = status;
        return this;
    }

    public DeploymentTestBuilder withOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
        return this;
    }

    public DeploymentTestBuilder withAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
        return this;
    }

    public DeploymentTestBuilder withNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public Deployment build() {
        Deployment deployment = new Deployment();
        deployment.setDeploymentId(deploymentId);
        deployment.setIncidentId(incidentId);
        deployment.setDeploymentRequestId(deploymentRequestId);
        deployment.setResponseUnitId(responseUnitId);
        deployment.setStatus(status);
        deployment.setVersion(version);
        deployment.setDeployedResources(deployedResources);
        deployment.setDeployedPersonnel(deployedPersonnel);
        deployment.setOrderedAt(orderedAt);
        deployment.setAssignedAt(assignedAt);
        deployment.setAcknowledgedAt(acknowledgedAt);
        deployment.setDispatchedAt(dispatchedAt);
        deployment.setArrivedAt(arrivedAt);
        deployment.setCompletedAt(completedAt);
        deployment.setCurrentLatitude(currentLatitude);
        deployment.setCurrentLongitude(currentLongitude);
        deployment.setEstimatedArrival(estimatedArrival);
        deployment.setConsumedResources(consumedResources);
        deployment.setNotes(notes);
        return deployment;
    }

    /**
     * Builds and returns a JSON payload string for REST API testing.
     */
    public String buildAsJsonPayload() {
        return String.format("""
            {
              "deploymentRequestId": %d,
              "responseUnitId": %d,
              "assignedPersonnel": [],
              "allocatedResources": [],
              "assignedBy": "test-operator",
              "notes": "%s"
            }
            """,
            deploymentRequestId,
            responseUnitId,
            escapeJson(notes)
        );
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
