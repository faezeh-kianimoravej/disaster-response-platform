package nl.saxion.disaster.deploymentservice.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deployment-requests")
@RequiredArgsConstructor
@Tag(
        name = "Deployment Allocation",
        description = "Assign real ResponseUnits to DeploymentRequests"
)
public class DeploymentController {

    private final DeploymentService deploymentService;

    @Operation(
            summary = "Assign ResponseUnits for a DeploymentRequest",
            description = """
                    This endpoint triggers the real resource allocation process.
                    
                    Frontend does NOT send quantity or unitId.
                    
                    Backend:
                    - Reads requestedQuantity from DeploymentRequest
                    - Finds available ResponseUnits
                    - Validates personnel & resources
                    - Creates one Deployment per assigned ResponseUnit
                    - Updates ResponseUnit + DeploymentRequest statuses
                    """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Allocation completed successfully"),
                    @ApiResponse(responseCode = "404", description = "DeploymentRequest not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid request or allocation rule violation")
            }
    )
    @PostMapping("/{deploymentRequestId}/assign")
    public ResponseEntity<DeploymentAssignResponseDTO> assignUnits(
            @PathVariable Long deploymentRequestId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Data required to approve/confirm the allocation",
                    required = true
            )
            @org.springframework.web.bind.annotation.RequestBody
            DeploymentAssignRequestDTO dto
    ) {

        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(deploymentRequestId, dto);

        return ResponseEntity.ok(response);
    }
}