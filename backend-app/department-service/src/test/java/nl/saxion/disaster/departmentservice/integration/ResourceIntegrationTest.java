package nl.saxion.disaster.departmentservice.integration;

import jakarta.persistence.EntityManager;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ResourceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager entityManager;

    private Department department;

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
                  "name": "Ambulance A1",
                  "description": "Main ambulance of Deventer",
                  "quantity": 2,
                  "available": true,
                  "resourceType": "AMBULANCE",
                  "latitude": 52.2661,
                  "longitude": 6.1552,
                  "department": { "departmentId": %d }
                }
                """, department.getDepartmentId());

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Ambulance A1"))
                .andExpect(jsonPath("$.department.departmentId").value(department.getDepartmentId()));
    }

    @Test
    void testUpdateResource() throws Exception {
        // ساخت اولیه Resource
        String createJson = String.format("""
                {
                  "name": "Old Vehicle",
                  "description": "To be updated",
                  "quantity": 1,
                  "available": true,
                  "resourceType": "TRANSPORT_VEHICLE",
                  "latitude": 52.2,
                  "longitude": 6.1,
                  "department": { "departmentId": %d }
                }
                """, department.getDepartmentId());

        String updateJson = String.format("""
                {
                  "name": "Updated Vehicle",
                  "description": "Updated description",
                  "quantity": 5,
                  "available": false,
                  "resourceType": "TRANSPORT_VEHICLE",
                  "latitude": 52.25,
                  "longitude": 6.18,
                  "department": { "departmentId": %d }
                }
                """, department.getDepartmentId());

        var result = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Long createdId = Long.parseLong(responseBody.replaceAll(".*\"resourceId\":(\\d+).*", "$1"));

        mockMvc.perform(put("/api/resources/" + createdId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Vehicle"))
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    void testDeleteResource() throws Exception {
        String createJson = String.format("""
                {
                  "name": "Temp Resource",
                  "description": "Will be deleted",
                  "quantity": 1,
                  "available": true,
                  "resourceType": "FIELD_OPERATOR",
                  "latitude": 52.1,
                  "longitude": 6.1,
                  "department": { "departmentId": %d }
                }
                """, department.getDepartmentId());

        var result = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Long createdId = Long.parseLong(responseBody.replaceAll(".*\"resourceId\":(\\d+).*", "$1"));

        mockMvc.perform(delete("/api/resources/" + createdId))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetNonExistingResource() throws Exception {
        mockMvc.perform(get("/api/resources/9999"))
                .andExpect(status().isNotFound());
    }
}
