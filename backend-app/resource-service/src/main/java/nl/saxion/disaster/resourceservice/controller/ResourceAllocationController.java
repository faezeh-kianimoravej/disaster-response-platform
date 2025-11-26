package nl.saxion.disaster.resourceservice.controller;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.resourceservice.dto.ResourceAllocationBatchRequestDTO;
import nl.saxion.disaster.resourceservice.service.contract.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceAllocationController {

    private final ResourceService service;

    @PostMapping("/allocate")
    public ResponseEntity<?> allocateResources(@RequestBody ResourceAllocationBatchRequestDTO request) {
        service.allocateResources(request);
        return ResponseEntity.ok("Resources successfully allocated.");
    }
}
