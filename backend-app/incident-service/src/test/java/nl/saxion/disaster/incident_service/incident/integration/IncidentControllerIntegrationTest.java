package nl.saxion.disaster.incident_service.incident.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("integration")
class IncidentControllerIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    private String sampleJson() {
        return """
        {
          "reportedBy": "112",
          "title": "Big Fire",
          "description": "Fire in apartment",
          "severity": "HIGH",
          "gripLevel": "LEVEL_2",
          "status": "OPEN",
          "reportedAt": "2025-12-11T21:00:00Z",
          "location": "Main Street 12",
          "latitude": 52.1,
          "longitude": 5.2,
          "regionId": 1
        }
        """;
    }

    @Test
    void createIncident_shouldReturn201AndPersist() throws Exception {
        mvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sampleJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Big Fire"))
                .andExpect(jsonPath("$.severity").value("HIGH"));
    }

    @Test
    void getIncidentById_shouldReturnIncident() throws Exception {
        var response = mvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sampleJson()))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = mapper.readTree(response).get("incidentId").asLong();

        mvc.perform(get("/api/incidents/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId").value(id));
    }

    @Test
    void listIncidents_shouldReturnArray() throws Exception {
        mvc.perform(get("/api/incidents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void deleteIncident_shouldRemoveIncident() throws Exception {
        var response = mvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sampleJson()))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = mapper.readTree(response).get("incidentId").asLong();

        mvc.perform(delete("/api/incidents/" + id))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/incidents/" + id))
                .andExpect(status().isNotFound());
    }
}
