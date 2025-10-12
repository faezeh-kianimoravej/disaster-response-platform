package nl.saxion.disaster.municipality_service.controller;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.municipality_service.model.dto.DepartmentDto;
import nl.saxion.disaster.municipality_service.model.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.service.contract.MunicipalityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/municipality")
@CrossOrigin(origins = "*")
public class MunicipalityController {

    private final MunicipalityService municipalityService;

    @GetMapping("/all")
    public ResponseEntity<List<MunicipalityDto>> getAllMunicipalities() {
        List<MunicipalityDto> municipalities = municipalityService.getAllMunicipalities();
        return ResponseEntity.ok(municipalities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MunicipalityDto> getMunicipalityById(@PathVariable Long id) {
        MunicipalityDto municipalityDto = municipalityService.getMunicipalityById(id);
        return ResponseEntity.ok(municipalityDto);
    }

    @PostMapping("/create")
    public ResponseEntity<MunicipalityDto> createMunicipality(@RequestBody Municipality municipality) {
        MunicipalityDto created = municipalityService.createMunicipality(municipality);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MunicipalityDto> updateMunicipality(@PathVariable Long id,
                                                              @RequestBody Municipality updatedMunicipality) {
        MunicipalityDto updatedMunicipalityDto = municipalityService.updateMunicipality(id, updatedMunicipality);
        return ResponseEntity.ok(updatedMunicipalityDto);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMunicipality(@PathVariable Long id) {
        municipalityService.deleteMunicipality(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/departments")
    public ResponseEntity<List<DepartmentDto>> getDepartmentsByMunicipalityId(@PathVariable("id") Long municipalityId) {
        List<DepartmentDto> departments = municipalityService.getDepartmentsOfMunicipality(municipalityId);
        return ResponseEntity.ok(departments);
    }
}
