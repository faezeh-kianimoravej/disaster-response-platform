package nl.saxion.disaster.departmentservice.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Disabled("Temporarily disabled until all services are integrated")
class ResourceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager entityManager;

    private Department department;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        Department dep = Department.builder()
                .name("Fire Department Deventer")
                .municipalityId(1L)
                .build();

        entityManager.persist(dep);
        entityManager.flush();
        department = dep;
    }

    @Test
    void testCreateResource() throws Exception {
        String resourceJson = String.format("""
                {
                  "resourceName": "Ambulance A1",
                  "description": "Main ambulance of Deventer",
                  "quantity": 2,
                  "available": true,
                  "type": "AMBULANCE",
                  "latitude": 52.2661,
                  "longitude": 6.1552,
                  "departmentId": %d
                }
                """, department.getDepartmentId());

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resourceName").value("Ambulance A1"))
                .andExpect(jsonPath("$.departmentId").value(department.getDepartmentId()));
    }

    @Test
    void testUpdateResource() throws Exception {
        // Create resource first
        String createJson = String.format("""
                {
                  "resourceName": "Old Vehicle",
                  "description": "To be updated",
                  "quantity": 1,
                  "available": true,
                  "type": "TRANSPORT_VEHICLE",
                  "latitude": 52.2,
                  "longitude": 6.1,
                  "departmentId": %d
                }
                """, department.getDepartmentId());

        String updateJson = String.format("""
                {
                  "resourceName": "Updated Vehicle",
                  "description": "Updated description",
                  "quantity": 5,
                  "available": false,
                  "type": "TRANSPORT_VEHICLE",
                  "latitude": 52.25,
                  "longitude": 6.18,
                  "departmentId": %d
                }
                """, department.getDepartmentId());

        var result = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        // Parse ID safely from JSON
        String responseBody = result.getResponse().getContentAsString();
        JsonNode jsonNode = mapper.readTree(responseBody);
        Long createdId = jsonNode.get("resourceId").asLong();

        mockMvc.perform(put("/api/resources/" + createdId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceName").value("Updated Vehicle"))
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    void testDeleteResource() throws Exception {
        String createJson = String.format("""
                {
                  "resourceName": "Temp Resource",
                  "description": "Will be deleted",
                  "quantity": 1,
                  "available": true,
                  "type": "FIELD_OPERATOR",
                  "latitude": 52.1,
                  "longitude": 6.1,
                  "departmentId": %d
                }
                """, department.getDepartmentId());

        var result = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        // Parse ID safely
        String responseBody = result.getResponse().getContentAsString();
        JsonNode jsonNode = mapper.readTree(responseBody);
        Long createdId = jsonNode.get("resourceId").asLong();

        mockMvc.perform(delete("/api/resources/" + createdId))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetNonExistingResource() throws Exception {
        mockMvc.perform(get("/api/resources/9999"))
                .andExpect(status().isNotFound());
    }
}
