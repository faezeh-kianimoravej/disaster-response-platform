package nl.saxion.disaster.deploymentservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.deploymentservice.controller.DeploymentController;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DeploymentController.class)
class DeploymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeploymentService deploymentService;

    // -------------------------------------------------------------------------
    // ASSIGN DEPLOYMENT – NORMAL FLOW
    // -------------------------------------------------------------------------

    @Test
    void assignUnits_shouldReturn200_whenRequestIsValid() throws Exception {
        when(deploymentService.allocateUnitsForDeploymentRequest(any()))
                .thenReturn(sampleResponse());

        mockMvc.perform(post("/api/deployment/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validAssignRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(1))
                .andExpect(jsonPath("$.requestStatus").value("ASSIGNED"))
                .andExpect(jsonPath("$.statusMessage")
                        .value("Deployment successfully created"));
    }

    // -------------------------------------------------------------------------
    // NO VALIDATION ENFORCED (DOCUMENTED BEHAVIOR)
    // -------------------------------------------------------------------------

    @Test
    void assignUnits_shouldReturn200_evenWhenRequestIdIsMissing() throws Exception {
        DeploymentAssignRequestDTO dto = validAssignRequest();
        dto.setRequestId(null); // validation is NOT enforced in controller

        when(deploymentService.allocateUnitsForDeploymentRequest(any()))
                .thenReturn(sampleResponse());

        mockMvc.perform(post("/api/deployment/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestStatus").value("ASSIGNED"));
    }

    // -------------------------------------------------------------------------
    // Test Data Builders
    // -------------------------------------------------------------------------

    private DeploymentAssignRequestDTO validAssignRequest() {
        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setRequestId(1L);
        dto.setAssignedBy(99L);
        dto.setAssignedUnitId(10L);

        DeploymentAssignRequestDTO.AssignedPersonnelDTO personnel =
                new DeploymentAssignRequestDTO.AssignedPersonnelDTO();
        personnel.setSlotId(1L);
        personnel.setUserId(100L);
        personnel.setSpecialization("FIREFIGHTER");

        DeploymentAssignRequestDTO.AllocatedResourceDTO resource =
                new DeploymentAssignRequestDTO.AllocatedResourceDTO();
        resource.setResourceId(200L);
        resource.setQuantity(2);
        resource.setIsPrimary(true);

        dto.setAssignedPersonnel(List.of(personnel));
        dto.setAllocatedResources(List.of(resource));
        dto.setNotes("Manual assignment");

        return dto;
    }

    private DeploymentAssignResponseDTO sampleResponse() {
        DeploymentAssignResponseDTO response = new DeploymentAssignResponseDTO();
        response.setRequestId(1L);
        response.setRequestStatus("ASSIGNED");
        response.setRequestAssignedBy(99L);
        response.setRequestAssignedAt(new Date());
        response.setNotes("Manual assignment");
        response.setStatusMessage("Deployment successfully created");
        response.setDeployments(List.of());
        return response;
    }
}
