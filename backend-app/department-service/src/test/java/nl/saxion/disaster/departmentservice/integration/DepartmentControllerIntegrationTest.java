package nl.saxion.disaster.departmentservice.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.departmentservice.controller.DepartmentController;
import nl.saxion.disaster.departmentservice.dto.*;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DepartmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DepartmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DepartmentService departmentService;

    // ------------------------------------------------------------------
    // GET /api/departments
    // ------------------------------------------------------------------
    @Test
    void shouldGetAllDepartments() throws Exception {

        when(departmentService.getAllDepartments()).thenReturn(
                List.of(
                        new DepartmentSummaryDto(1L, 1L, 10L, "Fire Department", null),
                        new DepartmentSummaryDto(1L, 2L, 10L, "Police Department", null)
                )
        );

        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Fire Department"))
                .andExpect(jsonPath("$[1].name").value("Police Department"));
    }

    // ------------------------------------------------------------------
    // GET /api/departments/{id}
    // ------------------------------------------------------------------
    @Test
    void shouldGetDepartmentById() throws Exception {

        DepartmentDto dto = new DepartmentDto(
                5L,
                7L,
                "EMS",
                null,
                List.of()
        );

        when(departmentService.getDepartmentById(5L))
                .thenReturn(Optional.of(dto));

        mockMvc.perform(get("/api/departments/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentId").value("5"))
                .andExpect(jsonPath("$.municipalityId").value("7"))
                .andExpect(jsonPath("$.name").value("EMS"));
    }

    @Test
    void shouldReturn404WhenDepartmentNotFound() throws Exception {

        when(departmentService.getDepartmentById(99L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/departments/99"))
                .andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------
    // POST /api/departments
    // ------------------------------------------------------------------
    @Test
    void shouldCreateDepartment() throws Exception {

        DepartmentDto request = new DepartmentDto(
                null,
                12L,
                "Fire Department",
                null,
                List.of()
        );

        DepartmentDto response = new DepartmentDto(
                1L,
                12L,
                "Fire Department",
                null,
                List.of()
        );

        when(departmentService.createDepartment(request))
                .thenReturn(response);

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.departmentId").value("1"))
                .andExpect(jsonPath("$.municipalityId").value("12"))
                .andExpect(jsonPath("$.name").value("Fire Department"));
    }

    // ------------------------------------------------------------------
    // PUT /api/departments/{id}
    // ------------------------------------------------------------------
    @Test
    void shouldUpdateDepartment() throws Exception {

        DepartmentDto request = new DepartmentDto(
                null,
                3L,
                "Updated Name",
                null,
                List.of()
        );

        DepartmentDto updated = new DepartmentDto(
                3L,
                3L,
                "Updated Name",
                null,
                List.of()
        );

        when(departmentService.updateDepartment(3L, request))
                .thenReturn(updated);

        mockMvc.perform(put("/api/departments/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentId").value("3"))
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    // ------------------------------------------------------------------
    // DELETE /api/departments/{id}
    // ------------------------------------------------------------------
    @Test
    void shouldDeleteDepartment() throws Exception {

        mockMvc.perform(delete("/api/departments/4"))
                .andExpect(status().isNoContent());
    }

    // ------------------------------------------------------------------
    // GET /api/departments/{id}/resources
    // ------------------------------------------------------------------
    @Test
    void shouldGetResourcesOfDepartment() throws Exception {

        when(departmentService.getResourcesOfDepartment(2L))
                .thenReturn(
                        List.of(
                                new ResourceSummaryDto(1L, "Fire Truck", null),
                                new ResourceSummaryDto(2L, "Ambulance", null)
                        )
                );

        mockMvc.perform(get("/api/departments/2/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Fire Truck"));
    }

    // ------------------------------------------------------------------
    // GET /api/departments/municipality/{id}
    // ------------------------------------------------------------------
    @Test
    void shouldGetDepartmentsByMunicipality() throws Exception {

        when(departmentService.getDepartmentsByMunicipality(8L))
                .thenReturn(
                        List.of(
                                new DepartmentSummaryDto(1L, 1L, 8L, "Police Department", null)
                        )
                );

        mockMvc.perform(get("/api/departments/municipality/8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Police Department"));
    }

    // ------------------------------------------------------------------
    // GET /api/departments/{id}/basic
    // ------------------------------------------------------------------
    @Test
    void shouldGetDepartmentBasicInfo() throws Exception {

        DepartmentBasicDto basicDto =
                new DepartmentBasicDto(5L, "EMS", 9L);

        when(departmentService.getDepartmentBasicInfoById(5L))
                .thenReturn(Optional.of(basicDto));

        mockMvc.perform(get("/api/departments/5/basic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentId").value(5))
                .andExpect(jsonPath("$.name").value("EMS"))
                .andExpect(jsonPath("$.municipalityId").value(9));
    }

    @Test
    void shouldReturn404WhenBasicDepartmentNotFound() throws Exception {

        when(departmentService.getDepartmentBasicInfoById(77L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/departments/77/basic"))
                .andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------
    // GET /api/departments/by-municipality/{id}/basic
    // ------------------------------------------------------------------
    @Test
    void shouldGetBasicDepartmentsByMunicipality() throws Exception {

        when(departmentService.getDepartmentsBasicInfoByMunicipalityId(6L))
                .thenReturn(
                        List.of(
                                new DepartmentBasicDto(1L, "Fire", 6L),
                                new DepartmentBasicDto(2L, "Police", 6L)
                        )
                );

        mockMvc.perform(get("/api/departments/by-municipality/6/basic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Fire"));
    }

    @Test
    void shouldReturn404WhenNoDepartmentsFoundForMunicipality() throws Exception {

        when(departmentService.getDepartmentsBasicInfoByMunicipalityId(100L))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/departments/by-municipality/100/basic"))
                .andExpect(status().isNotFound());
    }
}
