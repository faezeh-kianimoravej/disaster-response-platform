package nl.saxion.disaster.incident_service.controller;

import nl.saxion.disaster.incident_service.dto.*;
import nl.saxion.disaster.incident_service.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Tag(name = "Incident API", description = "Endpoints for managing incidents")
public class IncidentController {

    private final IncidentService service;

    @PostMapping
    @Operation(summary = "Create a new incident", description = "Adds a new incident record to the system.")
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody IncidentRequest req) {
        IncidentResponse created = service.createIncident(req);
        return ResponseEntity.created(URI.create("/api/incidents/" + created.incidentId())).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident by ID", description = "Fetch a single incident by its unique ID.")
    public ResponseEntity<IncidentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "List all incidents", description = "Fetch all existing incidents or filter by reporter.")
    public ResponseEntity<List<IncidentResponse>> list(@RequestParam Optional<String> reportedBy) {
        return ResponseEntity.ok(service.list(reportedBy));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an incident", description = "Modify details of an existing incident by ID.")
    public ResponseEntity<IncidentResponse> update(@PathVariable Long id, @Valid @RequestBody IncidentRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an incident", description = "Remove an incident record permanently by ID.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
