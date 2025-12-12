package nl.saxion.disaster.deploymentservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.deploymentservice.controller.DeploymentOrderController;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentOrderService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DeploymentOrderController.class)
class DeploymentOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeploymentOrderService deploymentOrderService;

    // -------------------------------------------------------------------------
    // CREATE DEPLOYMENT ORDER
    // -------------------------------------------------------------------------

    @Test
    void createDeploymentOrder_shouldReturn201_whenRequestIsValid() throws Exception {
        when(deploymentOrderService.createDeploymentOrder(any()))
                .thenReturn(sampleDeploymentOrder());

        mockMvc.perform(post("/api/deployment-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deploymentOrderId").value("1"))
                .andExpect(jsonPath("$.incidentId").value("100"))
                .andExpect(jsonPath("$.incidentSeverity").value("HIGH"));
    }

    @Test
    void createDeploymentOrder_shouldReturn400_whenIncidentIdMissing() throws Exception {
        DeploymentOrderCreateDTO dto = validCreateRequest();
        dto.setIncidentId(null); // ❌ invalid

        mockMvc.perform(post("/api/deployment-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // -------------------------------------------------------------------------
    // GET BY INCIDENT ID
    // -------------------------------------------------------------------------

    @Test
    void getDeploymentOrdersByIncidentId_shouldReturn200() throws Exception {
        when(deploymentOrderService.getDeploymentOrdersByIncidentId(100L))
                .thenReturn(List.of(sampleDeploymentOrder()));

        mockMvc.perform(get("/api/deployment-orders/incident/{incidentId}", 100L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].deploymentOrderId").value("1"))
                .andExpect(jsonPath("$[0].incidentId").value("100"));
    }

    // -------------------------------------------------------------------------
    // Test Data Builders
    // -------------------------------------------------------------------------

    private DeploymentOrderCreateDTO validCreateRequest() {
        DeploymentOrderCreateDTO dto = new DeploymentOrderCreateDTO();
        dto.setIncidentId(100L);
        dto.setOrderedBy(200L);
        dto.setIncidentSeverity(IncidentSeverity.HIGH);
        dto.setNotes("Major incident");

        DeploymentOrderCreateDTO.Request request =
                new DeploymentOrderCreateDTO.Request();
        request.setTargetDepartmentId(10L);
        request.setRequestedUnitType(ResponseUnitType.FIRE_TRUCK);
        request.setRequestedQuantity(2);

        dto.setDeploymentRequests(List.of(request));
        return dto;
    }

    private DeploymentOrderDTO sampleDeploymentOrder() {
        DeploymentOrderDTO dto = new DeploymentOrderDTO();
        dto.setDeploymentOrderId(1L);
        dto.setIncidentId(100L);
        dto.setOrderedBy(200L);
        dto.setOrderedAt(new Date());
        dto.setIncidentSeverity(IncidentSeverity.HIGH);
        dto.setNotes("Major incident");
        dto.setDeploymentRequests(List.of());
        return dto;
    }
}

