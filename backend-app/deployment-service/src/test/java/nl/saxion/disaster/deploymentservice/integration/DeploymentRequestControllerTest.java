package nl.saxion.disaster.deploymentservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.deploymentservice.controller.DeploymentRequestController;
import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentRequestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DeploymentRequestController.class)
class DeploymentRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeploymentRequestService deploymentRequestService;

    // -------------------------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------------------------

    @Test
    void getDeploymentRequestById_shouldReturn200_whenFound() throws Exception {
        when(deploymentRequestService.getDeploymentRequestById(1L))
                .thenReturn(Optional.of(sampleDeploymentRequest()));

        mockMvc.perform(get("/api/deployment-requests/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value("1"))
                .andExpect(jsonPath("$.incidentId").value("100"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getDeploymentRequestById_shouldReturn404_whenNotFound() throws Exception {
        when(deploymentRequestService.getDeploymentRequestById(99L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/deployment-requests/{id}", 99L))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------------------
    // GET BY DEPARTMENT
    // -------------------------------------------------------------------------

    @Test
    void getDeploymentRequestsByDepartment_shouldReturn200() throws Exception {
        when(deploymentRequestService.getDeploymentRequestsByDepartmentId(10L))
                .thenReturn(List.of(sampleDeploymentRequest()));

        mockMvc.perform(get("/api/deployment-requests/department/{departmentId}/requests", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].targetDepartmentId").value("10"))
                .andExpect(jsonPath("$[0].requestedQuantity").value(2));
    }

    // -------------------------------------------------------------------------
    // Test Data Builder
    // -------------------------------------------------------------------------

    private DeploymentRequestDTO sampleDeploymentRequest() {
        DeploymentRequestDTO dto = new DeploymentRequestDTO();
        dto.setRequestId(1L);
        dto.setIncidentId(100L);
        dto.setDeploymentOrderId(200L);
        dto.setRequestedBy(300L);
        dto.setRequestedAt(new Date());

        dto.setTargetDepartmentId(10L);
        dto.setPriority(IncidentSeverity.HIGH);
        dto.setRequestedUnitType(ResponseUnitType.FIRE_TRUCK);
        dto.setRequestedQuantity(2);

        dto.setAssignedUnitId(null);
        dto.setAssignedBy(null);
        dto.setAssignedAt(null);

        dto.setStatus(DeploymentRequestStatus.PENDING);
        dto.setNotes("Urgent request");

        return dto;
    }
}

