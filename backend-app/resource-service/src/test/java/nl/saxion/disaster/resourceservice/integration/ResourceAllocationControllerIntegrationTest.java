package nl.saxion.disaster.resourceservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.resourceservice.controller.ResourceAllocationController;
import nl.saxion.disaster.resourceservice.dto.ResourceAllocationBatchRequestDTO;
import nl.saxion.disaster.resourceservice.dto.ResourceAllocationItemDTO;
import nl.saxion.disaster.resourceservice.service.contract.ResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResourceAllocationController.class)
class ResourceAllocationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ResourceService resourceService;

    @Test
    void allocateResources_shouldReturn200_whenRequestIsValid() throws Exception {
        // given
        ResourceAllocationBatchRequestDTO request = validRequest();

        doNothing().when(resourceService).allocateResources(any());

        // when + then
        mockMvc.perform(post("/api/resources/allocate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Resources successfully allocated."));
    }

    private ResourceAllocationBatchRequestDTO validRequest() {
        ResourceAllocationItemDTO item = new ResourceAllocationItemDTO();
        item.setResourceId(100L);
        item.setQuantity(2);

        ResourceAllocationBatchRequestDTO dto = new ResourceAllocationBatchRequestDTO();
        dto.setDeploymentId(10L);
        dto.setResponseUnitId(20L);
        dto.setAllocations(List.of(item));

        return dto;
    }
}
