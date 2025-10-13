package nl.saxion.disaster.departmentservice.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class DepartmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCreateDepartment() throws Exception {
        String json = """
                {
                    "name": "Fire Department Deventer",
                    "municipalityId": 1
                }
                """;

        mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Fire Department Deventer"))
                .andExpect(jsonPath("$.municipalityId").value(1));
    }

    @Test
    void testGetAllDepartments() throws Exception {
        String json = """
                {
                    "name": "Health Department",
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
        String createJson = """
                {
                    "name": "Old Department",
                    "municipalityId": 3
                }
                """;

        var result = mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        Long id = Long.parseLong(body.replaceAll(".*\"departmentId\":(\\d+).*", "$1"));

        String updateJson = """
                {
                    "name": "Updated Department",
                    "municipalityId": 3
                }
                """;

        mockMvc.perform(put("/api/department/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Department"));
    }

    @Test
    void testDeleteDepartment() throws Exception {
        String createJson = """
                {
                    "name": "Temp Department",
                    "municipalityId": 4
                }
                """;

        var result = mockMvc.perform(post("/api/department")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        Long id = Long.parseLong(body.replaceAll(".*\"departmentId\":(\\d+).*", "$1"));

        mockMvc.perform(delete("/api/department/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetDepartmentsByMunicipality() throws Exception {
        String dep1 = """
                {
                    "name": "Police Department",
                    "municipalityId": 10
                }
                """;
        String dep2 = """
                {
                    "name": "Fire Department",
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
