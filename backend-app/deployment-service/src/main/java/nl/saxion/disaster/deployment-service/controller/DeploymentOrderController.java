package nl.saxion.disaster.deploymentservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Tag(name = "Deployment Orders", description = "Create and manage deployment orders")
@RestController
@RequestMapping("/api/deployment-orders")
@RequiredArgsConstructor
public class DeploymentOrderController {

    private final DeploymentOrderService deploymentOrderService;

    @Operation(summary = "Create a new deployment order")
    @PostMapping
    public ResponseEntity<DeploymentOrderDTO> create(@Valid @RequestBody DeploymentOrderCreateDTO dto) {
        DeploymentOrderDTO created = deploymentOrderService.create(dto);
        return ResponseEntity
                .created(URI.create("/api/deployment-orders/" + created.getDeploymentOrderId()))
                .body(created);
    }
}