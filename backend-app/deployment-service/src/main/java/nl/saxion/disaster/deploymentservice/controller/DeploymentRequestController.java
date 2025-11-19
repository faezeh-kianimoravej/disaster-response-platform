package nl.saxion.disaster.deploymentservice.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/deployment-requests")
@Tag(name = "Deployment Requests", description = "Manage and view deployment requests")
public class DeploymentRequestController {

    private final DeploymentRequestService deploymentRequestService;

    @Operation(
            summary = "Get all deployment requests for a department",
            description = "Returns a list of deployment requests that target the specified department ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved deployment requests"),
            @ApiResponse(responseCode = "404", description = "No deployment requests found for the given department ID"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })

    @GetMapping("/{id}")
    public ResponseEntity<DeploymentRequestDTO> getRequestsById(
            @PathVariable Long id
    ) {
        return deploymentRequestService.getDeploymentRequestById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{departmentId}/requests")
    public ResponseEntity<List<DeploymentRequestDTO>> getRequestsByDepartment(
            @PathVariable Long departmentId
    ) {
        List<DeploymentRequestDTO> requests =
                deploymentRequestService.getDeploymentRequestsByDepartmentId(departmentId);

        return ResponseEntity.ok(requests);
    }
}
