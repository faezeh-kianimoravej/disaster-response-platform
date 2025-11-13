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
    public ResponseEntity<ResponseUnitDTO> createResponseUnit(@Valid @RequestBody ResponseUnitCreateDTO dto) {
        ResponseUnitDTO created = responseUnitService.createResponseUnit(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{unitId}")
    public ResponseEntity<ResponseUnitDTO> getResponseUnitById(@PathVariable Long unitId) {
        ResponseUnitDTO unit = responseUnitService.getResponseUnitById(unitId);
        return ResponseEntity.ok(unit);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<ResponseUnitDTO>> getResponseUnitByDepartmentId(@PathVariable Long departmentId) {
        List<ResponseUnitDTO> units = responseUnitService.getResponseUnitByDepartmentId(departmentId);
        return ResponseEntity.ok(units);
    }

    @GetMapping
    public ResponseEntity<List<ResponseUnitDTO>> getAllResponseUnits() {
        List<ResponseUnitDTO> units = responseUnitService.getAllResponseUnits();
        return ResponseEntity.ok(units);
    }

    @PutMapping("/{unitId}")
    public ResponseEntity<ResponseUnitDTO> updateResponseUnit(@PathVariable Long unitId, @Valid @RequestBody ResponseUnitCreateDTO dto) {
        ResponseUnitDTO updated = responseUnitService.updateResponseUnit(unitId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{unitId}")
    public ResponseEntity<Void> deleteResponseUnit(@PathVariable Long unitId) {
        responseUnitService.deleteResponseUnit(unitId);
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
    public ResponseEntity<List<ResponseUnitSearchResponseDTO>> searchAvailableResponseUnits(
            @Valid @RequestBody ResponseUnitSearchRequestDTO request) {
        List<ResponseUnitSearchResponseDTO> units = responseUnitService.searchAvailableUnits(request);
        return ResponseEntity.ok(units);
    }
}

