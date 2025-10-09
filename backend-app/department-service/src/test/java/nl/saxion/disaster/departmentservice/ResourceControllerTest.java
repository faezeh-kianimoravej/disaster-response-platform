package nl.saxion.disaster.departmentservice;

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
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private Department department;

    @BeforeEach
    void setup() {
        // INSERT INTO departments (name) VALUES ('Fire Department Deventer');
        department = Department.builder()
                .departmentId(1L)
                .name("Fire Department Deventer")
                .build();
    }

    @Test
    void testCreateResource() throws Exception {
        String resourceJson = """
                {
                  "name": "Ambulance A1",
                  "description": "Main ambulance of Deventer",
                  "quantity": 2,
                  "available": true,
                  "resourceType": "AMBULANCE",
                  "latitude": 52.2661,
                  "longitude": 6.1552,
                  "department": { "departmentId": 1 }
                }
                """;

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Ambulance A1"))
                .andExpect(jsonPath("$.department.departmentId").value(1));
    }

    @Test
    void testUpdateResource() throws Exception {
        String createJson = """
                {
                  "name": "Old Vehicle",
                  "description": "To be updated",
                  "quantity": 1,
                  "available": true,
                  "resourceType": "TRANSPORT_VEHICLE",
                  "latitude": 52.2,
                  "longitude": 6.1,
                  "department": { "departmentId": 1 }
                }
                """;

        String updateJson = """
                {
                  "name": "Updated Vehicle",
                  "description": "Updated description",
                  "quantity": 5,
                  "available": false,
                  "resourceType": "TRANSPORT_VEHICLE",
                  "latitude": 52.25,
                  "longitude": 6.18,
                  "department": { "departmentId": 1 }
                }
                """;

        var result = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        // از پاسخ ID رو بگیر
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
        String createJson = """
                {
                  "name": "Temp Resource",
                  "description": "Will be deleted",
                  "quantity": 1,
                  "available": true,
                  "resourceType": "FIELD_OPERATOR",
                  "latitude": 52.1,
                  "longitude": 6.1,
                  "department": { "departmentId": 1 }
                }
                """;

        var result = mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Long createdId = Long.parseLong(responseBody.replaceAll(".*\"resourceId\":(\\d+).*", "$1"));

        // حذف resource
        mockMvc.perform(delete("/api/resources/" + createdId))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetNonExistingResource() throws Exception {
        mockMvc.perform(get("/api/resources/9999"))
                .andExpect(status().isNotFound());
    }
}
