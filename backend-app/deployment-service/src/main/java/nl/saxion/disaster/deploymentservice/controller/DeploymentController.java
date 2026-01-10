package nl.saxion.disaster.deploymentservice.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.client.IncidentBasicDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deployment")
@RequiredArgsConstructor
@Tag(
        name = "Deployment Allocation",
        description = "Assign real ResponseUnits to DeploymentRequests"
)
public class DeploymentController {

    private final DeploymentService deploymentService;

    @Operation(
            summary = "Manually assign a ResponseUnit to a DeploymentRequest",
            description = """
                This endpoint performs manual allocation of a ResponseUnit.

                Frontend provides:
                - requestId             → ID of the DeploymentRequest
                - assignedUnitId        → ResponseUnit to deploy
                - assignedPersonnel     → personnel list
                - allocatedResources    → resource list
                - assignedBy            → operator performing the allocation
                - notes                 → optional remarks

                Backend performs:
                - Validates the DeploymentRequest and selected ResponseUnit
                - Updates ResponseUnit.currentPersonnel
                - Updates ResponseUnit.currentResources
                - Creates a Deployment snapshot
                - Updates ResponseUnit + DeploymentRequest status

                Manual allocation replaces the previous auto-assignment logic.
                """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Unit successfully assigned and deployment created"),
                    @ApiResponse(responseCode = "404", description = "DeploymentRequest or ResponseUnit not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid allocation data")
            }
    )
    @PostMapping("/assign")
    public ResponseEntity<DeploymentAssignResponseDTO> assignUnits(

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Manual allocation data (unit + personnel + resources + requestId)",
                    required = true
            )
            @org.springframework.web.bind.annotation.RequestBody
            DeploymentAssignRequestDTO dto
    ) {

        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(dto);

        return ResponseEntity.ok(response);
    }

    // ----------------------------------------------------------------------------------------
    // Get incident basic info for a responder
    // ----------------------------------------------------------------------------------------
    @Operation(
            summary = "Get current incident details for a responder",
            description = """
                Resolves the responder's ResponseUnit, finds the latest ASSIGNED Deployment for that unit,
                then calls incident-service to fetch the IncidentBasicDTO for the linked incidentId.
                """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Incident retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "ResponseUnit / Deployment / Incident not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid responderId"),
                    @ApiResponse(responseCode = "500", description = "Unexpected error")
            }
    )
    @GetMapping("/responder/{responderId}/incident")
    public ResponseEntity<IncidentBasicDTO> getIncidentForResponder(@PathVariable Long responderId) {
        IncidentBasicDTO incident = deploymentService.getIncidentBasicDtoForResponder(responderId);
        return ResponseEntity.ok(incident);
    }
}