package nl.saxion.disaster.deploymentservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.deploymentservice.controller.ResponseUnitController;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchResponseDTO;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import nl.saxion.disaster.deploymentservice.service.contract.ResponseUnitService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResponseUnitController.class)
class ResponseUnitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ResponseUnitService responseUnitService;

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    @Test
    void createResponseUnit_shouldReturn201_whenRequestIsValid() throws Exception {
        when(responseUnitService.createResponseUnit(any()))
                .thenReturn(sampleResponseUnitDTO());

        mockMvc.perform(post("/api/response-units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.unitId").value("1"))
                .andExpect(jsonPath("$.unitName").value("Fire Truck Alpha"));
    }

    @Test
    void createResponseUnit_shouldReturn400_whenStatusIsMissing() throws Exception {
        ResponseUnitCreateDTO dto = new ResponseUnitCreateDTO();
        dto.setUnitName("Fire Truck Alpha");
        dto.setDepartmentId(10L);
        dto.setUnitType(ResponseUnitType.FIRE_TRUCK);
        // status عمداً ست نشده

        mockMvc.perform(post("/api/response-units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // -------------------------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------------------------

    @Test
    void getResponseUnitById_shouldReturn200() throws Exception {
        when(responseUnitService.getResponseUnitById(1L))
                .thenReturn(sampleResponseUnitDTO());

        mockMvc.perform(get("/api/response-units/{unitId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unitId").value("1"));
    }

    // -------------------------------------------------------------------------
    // GET BY DEPARTMENT
    // -------------------------------------------------------------------------

    @Test
    void getResponseUnitsByDepartment_shouldReturn200() throws Exception {
        when(responseUnitService.getResponseUnitByDepartmentId(10L))
                .thenReturn(List.of(sampleResponseUnitDTO()));

        mockMvc.perform(get("/api/response-units/department/{departmentId}", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].departmentId").value("10"));
    }

    // -------------------------------------------------------------------------
    // GET ALL
    // -------------------------------------------------------------------------

    @Test
    void getAllResponseUnits_shouldReturn200() throws Exception {
        when(responseUnitService.getAllResponseUnits())
                .thenReturn(List.of(sampleResponseUnitDTO()));

        mockMvc.perform(get("/api/response-units"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].unitId").value("1"));
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    @Test
    void updateResponseUnit_shouldReturn200() throws Exception {
        when(responseUnitService.updateResponseUnit(eq(1L), any()))
                .thenReturn(sampleResponseUnitDTO());

        mockMvc.perform(put("/api/response-units/{unitId}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unitId").value("1"));
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    @Test
    void deleteResponseUnit_shouldReturn204() throws Exception {
        doNothing().when(responseUnitService).deleteResponseUnit(1L);

        mockMvc.perform(delete("/api/response-units/{unitId}", 1L))
                .andExpect(status().isNoContent());
    }

    // -------------------------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------------------------

    @Test
    void searchAvailableResponseUnits_shouldReturn200() throws Exception {
        when(responseUnitService.searchAvailableUnits(any()))
                .thenReturn(List.of(new ResponseUnitSearchResponseDTO()));

        mockMvc.perform(post("/api/response-units/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validSearchRequest())))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------------------
    // Test Data Builders
    // -------------------------------------------------------------------------

    private ResponseUnitCreateDTO validCreateRequest() {
        ResponseUnitCreateDTO dto = new ResponseUnitCreateDTO();
        dto.setUnitName("Fire Truck Alpha");
        dto.setDepartmentId(10L);
        dto.setUnitType(ResponseUnitType.FIRE_TRUCK);
        dto.setStatus(ResponseUnitStatus.AVAILABLE); // ✅ مهم
        return dto;
    }

    private ResponseUnitSearchRequestDTO validSearchRequest() {
        ResponseUnitSearchRequestDTO dto = new ResponseUnitSearchRequestDTO();
        dto.setUnitType(ResponseUnitType.FIRE_TRUCK);
        return dto;
    }

    private ResponseUnitDTO sampleResponseUnitDTO() {
        ResponseUnitDTO dto = new ResponseUnitDTO();
        dto.setUnitId(1L);
        dto.setUnitName("Fire Truck Alpha");
        dto.setDepartmentId(10L);
        dto.setUnitType(ResponseUnitType.FIRE_TRUCK);
        dto.setStatus(ResponseUnitStatus.AVAILABLE);
        return dto;
    }
}
