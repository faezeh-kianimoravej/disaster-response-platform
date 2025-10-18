package nl.saxion.disaster.departmentservice.integration;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Disabled("Temporarily disabled until all services are integrated")
class DepartmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCreateDepartment() throws Exception {
        String json = """
                {
                    "departmentName": "Fire Department Deventer",
                    "municipalityId": 1
                }
                """;

        mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.departmentId").exists())
                .andExpect(jsonPath("$.departmentName").value("Fire Department Deventer"))
                .andExpect(jsonPath("$.municipalityId").value(1));
    }

    @Test
    void testGetAllDepartments() throws Exception {
        String json = """
                {
                    "departmentName": "Health Department",
                    "municipalityId": 2
                }
                """;

        mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/department/all_departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetDepartmentById_NotFound() throws Exception {
        mockMvc.perform(get("/api/department/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateDepartment() throws Exception {
        // --- Create department ---
        String createJson = """
                {
                    "departmentName": "Old Department",
                    "municipalityId": 3
                }
                """;

        var createResult = mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String body = createResult.getResponse().getContentAsString();
        String idString = JsonPath.read(body, "$.departmentId");

        // --- Update department ---
        String updateJson = """
                {
                    "departmentName": "Updated Department",
                    "municipalityId": 3
                }
                """;

        var updateResult = mockMvc.perform(put("/api/department/" + idString)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentName").value("Updated Department"))
                .andExpect(jsonPath("$.municipalityId").value(3))
                .andExpect(jsonPath("$.departmentId").exists()) // فقط وجود id مهم است
                .andReturn();

        String updatedBody = updateResult.getResponse().getContentAsString();
        assertNotNull(updatedBody);
    }


    @Test
    void testDeleteDepartment() throws Exception {
        // Create
        String createJson = """
                {
                    "departmentName": "Temp Department",
                    "municipalityId": 4
                }
                """;

        var createResult = mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String body = createResult.getResponse().getContentAsString();
        // ✅ Handle ID as string → Long
        String idString = JsonPath.read(body, "$.departmentId");
        Long id = Long.parseLong(idString);

        // Delete
        mockMvc.perform(delete("/api/department/" + id))
                .andExpect(status().isNoContent());

        // Confirm deletion
        mockMvc.perform(get("/api/department/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetDepartmentsByMunicipality() throws Exception {
        String dep1 = """
                {
                    "departmentName": "Police Department",
                    "municipalityId": 10
                }
                """;
        String dep2 = """
                {
                    "departmentName": "Fire Department",
                    "municipalityId": 10
                }
                """;

        mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dep1))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dep2))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/department/by-municipality/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].municipalityId").value(10));
    }
}
