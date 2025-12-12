package nl.saxion.disaster.resourceservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.resourceservice.controller.ResourceController;
import nl.saxion.disaster.resourceservice.dto.*;
import nl.saxion.disaster.resourceservice.model.enums.*;
import nl.saxion.disaster.resourceservice.service.contract.ResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResourceController.class)
@AutoConfigureMockMvc
class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResourceService resourceService;

    @Autowired
    private ObjectMapper objectMapper;

    // ------------------------------------------------------
    // GET /api/resources/{id}
    // ------------------------------------------------------
    @Test
    void shouldGetResourceById() throws Exception {

        ResourceDto resource =
                createResourceDto(1L, "Ambulance A1", ResourceType.AMBULANCE);

        when(resourceService.getResourceById(1L))
                .thenReturn(Optional.of(resource));

        mockMvc.perform(get("/api/resources/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceId").value("1"))
                .andExpect(jsonPath("$.name").value("Ambulance A1"))
                .andExpect(jsonPath("$.resourceType").value("AMBULANCE"))
                .andExpect(jsonPath("$.category").value("VEHICLE"))
                .andExpect(jsonPath("$.resourceKind").value("UNIQUE"));
    }

    // ------------------------------------------------------
    // GET /api/resources/{id}/location
    // ------------------------------------------------------
    @Test
    void shouldGetResourceLocationById() throws Exception {

        ResourceLocationDto location =
                new ResourceLocationDto(1L, 52.2215, 6.8937);

        when(resourceService.getResourceLocationById(1L))
                .thenReturn(Optional.of(location));

        mockMvc.perform(get("/api/resources/1/location"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceId").value("1"))
                .andExpect(jsonPath("$.latitude").value(52.2215))
                .andExpect(jsonPath("$.longitude").value(6.8937));
    }

    // ------------------------------------------------------
    // GET /api/resources/available
    // ------------------------------------------------------
    @Test
    void shouldGetAvailableResources() throws Exception {

        when(resourceService.getAvailableResources())
                .thenReturn(List.of(
                        createResourceDto(1L, "Ambulance A1", ResourceType.AMBULANCE),
                        createResourceDto(2L, "Fire Truck F1", ResourceType.FIRE_TRUCK)
                ));

        mockMvc.perform(get("/api/resources/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ------------------------------------------------------
    // GET /api/resources/resourceType/{resourceType}
    // ------------------------------------------------------
    @Test
    void shouldGetResourcesByType() throws Exception {

        when(resourceService.getResourcesByType(ResourceType.DEFIBRILLATOR))
                .thenReturn(List.of(
                        createResourceDto(3L, "Defibrillator D1", ResourceType.DEFIBRILLATOR)
                ));

        mockMvc.perform(get("/api/resources/resourceType/DEFIBRILLATOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].resourceType").value("DEFIBRILLATOR"))
                .andExpect(jsonPath("$[0].category").value("EQUIPMENT"));
    }

    // ------------------------------------------------------
    // POST /api/resources
    // ------------------------------------------------------
    @Test
    void shouldCreateResource() throws Exception {

        ResourceDto request =
                createResourceDto(null, "Medical Kit", ResourceType.MEDICAL_KIT);

        ResourceDto response =
                createResourceDto(10L, "Medical Kit", ResourceType.MEDICAL_KIT);

        when(resourceService.createResource(request))
                .thenReturn(response);

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resourceId").value("10"))
                .andExpect(jsonPath("$.resourceType").value("MEDICAL_KIT"))
                .andExpect(jsonPath("$.category").value("CONSUMABLE"));
    }

    // ------------------------------------------------------
    // PUT /api/resources/{id}
    // ------------------------------------------------------
    @Test
    void shouldEditResource() throws Exception {

        ResourceDto request =
                createResourceDto(null, "Updated Generator", ResourceType.GENERATOR);

        ResourceDto response =
                createResourceDto(5L, "Updated Generator", ResourceType.GENERATOR);

        when(resourceService.editResource(5L, request))
                .thenReturn(response);

        mockMvc.perform(put("/api/resources/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Generator"))
                .andExpect(jsonPath("$.resourceType").value("GENERATOR"));
    }

    // ------------------------------------------------------
    // DELETE /api/resources/{id}
    // ------------------------------------------------------
    @Test
    void shouldDeleteResource() throws Exception {

        doNothing().when(resourceService).deleteResource(7L);

        mockMvc.perform(delete("/api/resources/7"))
                .andExpect(status().isNoContent());
    }

    // ------------------------------------------------------
    // GET /api/resources/{id}/basic
    // ------------------------------------------------------
    @Test
    void shouldGetResourceBasicInfoById() throws Exception {

        ResourceBasicDto basic =
                new ResourceBasicDto(
                        1L,
                        "Police Patrol Car",
                        ResourceType.PATROL_CAR,
                        20L
                );

        when(resourceService.getResourceBasicInfoById(1L))
                .thenReturn(Optional.of(basic));

        mockMvc.perform(get("/api/resources/1/basic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Police Patrol Car"))
                .andExpect(jsonPath("$.resourceType").value("PATROL_CAR"))
                .andExpect(jsonPath("$.departmentId").value(20));
    }

    // ------------------------------------------------------
    // helper
    // ------------------------------------------------------
    private ResourceDto createResourceDto(
            Long resourceId,
            String name,
            ResourceType type
    ) {
        return new ResourceDto(
                resourceId,
                10L,
                name,
                "Test resource description",
                type.getCategory(),
                type,
                ResourceKind.UNIQUE,
                ResourceStatus.AVAILABLE,
                10,
                10,
                "unit",
                true,
                52.2215,
                6.8937,
                LocalDateTime.now(),
                null,
                0,
                null
        );
    }
}
