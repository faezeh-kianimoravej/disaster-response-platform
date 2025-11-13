package nl.saxion.disaster.deploymentservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchResponseDTO;
import nl.saxion.disaster.deploymentservice.service.contract.ResponseUnitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Response Units", description = "Create and manage response units")
@RestController
@RequestMapping("/api/response-units")
@RequiredArgsConstructor
public class ResponseUnitController {

    private final ResponseUnitService responseUnitService;

    @PostMapping
    public ResponseEntity<ResponseUnitDTO> create(@Valid @RequestBody ResponseUnitCreateDTO dto) {
        ResponseUnitDTO created = responseUnitService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{unitId}")
    public ResponseEntity<ResponseUnitDTO> getById(@PathVariable Long unitId) {
        ResponseUnitDTO unit = responseUnitService.getById(unitId);
        return ResponseEntity.ok(unit);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<ResponseUnitDTO>> getByDepartmentId(@PathVariable Long departmentId) {
        List<ResponseUnitDTO> units = responseUnitService.getByDepartmentId(departmentId);
        return ResponseEntity.ok(units);
    }

    @GetMapping
    public ResponseEntity<List<ResponseUnitDTO>> getAll() {
        List<ResponseUnitDTO> units = responseUnitService.getAll();
        return ResponseEntity.ok(units);
    }

    @PutMapping("/{unitId}")
    public ResponseEntity<ResponseUnitDTO> update(@PathVariable Long unitId, @Valid @RequestBody ResponseUnitCreateDTO dto) {
        ResponseUnitDTO updated = responseUnitService.update(unitId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{unitId}")
    public ResponseEntity<Void> delete(@PathVariable Long unitId) {
        responseUnitService.delete(unitId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search")
    @Operation(
            summary = "Search for available response units",
            description = """
                    Search for available response units based on unit type, location, and availability.
                    Returns the closest 10 available units to the incident location, sorted by distance.
                    Can filter by specific department or municipality.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Available units retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    public ResponseEntity<List<ResponseUnitSearchResponseDTO>> searchAvailableUnits(
            @Valid @RequestBody ResponseUnitSearchRequestDTO request) {
        List<ResponseUnitSearchResponseDTO> units = responseUnitService.searchAvailableUnits(request);
        return ResponseEntity.ok(units);
    }
}

