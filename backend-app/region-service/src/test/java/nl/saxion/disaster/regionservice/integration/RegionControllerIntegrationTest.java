package nl.saxion.disaster.regionservice.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.regionservice.controller.RegionController;
import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.dto.RegionSummaryDto;
import nl.saxion.disaster.regionservice.service.contract.RegionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RegionController.class)
@AutoConfigureMockMvc
class RegionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RegionService regionService;

    @Autowired
    private ObjectMapper objectMapper;

    // ------------------------------------------------------
    // GET /api/regions
    // ------------------------------------------------------
    @Test
    @WithMockUser(roles = "REGION_ADMIN")
    void shouldGetAllRegions() throws Exception {

        List<RegionSummaryDto> regions = List.of(
                new RegionSummaryDto(1L, "East Region", "east.png"),
                new RegionSummaryDto(2L, "West Region", "west.png")
        );

        when(regionService.getAllRegions()).thenReturn(regions);

        mockMvc.perform(get("/api/regions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].regionId").value(1L))
                .andExpect(jsonPath("$[0].name").value("East Region"))
                .andExpect(jsonPath("$[0].image").value("east.png"));
    }

    // ------------------------------------------------------
    // GET /api/regions/{id}
    // ------------------------------------------------------
    @Test
    @WithMockUser(roles = "REGION_ADMIN")
    void shouldGetRegionById() throws Exception {

        RegionDto region = new RegionDto(
                1L,
                "Central Region",
                "central.png",
                List.of(
                        new MunicipalityDto(10L, 1L, "Apeldoorn", null),
                        new MunicipalityDto(11L, 1L, "Deventer", null)
                )
        );

        when(regionService.getRegionById(1L)).thenReturn(region);

        mockMvc.perform(get("/api/regions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.regionId").value(1L))
                .andExpect(jsonPath("$.name").value("Central Region"))
                .andExpect(jsonPath("$.image").value("central.png"))
                .andExpect(jsonPath("$.municipalities.length()").value(2))
                .andExpect(jsonPath("$.municipalities[0].municipalityId").value("10"))
                .andExpect(jsonPath("$.municipalities[0].regionId").value("1"))
                .andExpect(jsonPath("$.municipalities[0].name").value("Apeldoorn"));
    }

    // ------------------------------------------------------
    // POST /api/regions
    // ------------------------------------------------------
    @Test
    @WithMockUser(roles = "REGION_ADMIN")
    void shouldCreateRegion() throws Exception {

        RegionDto request = new RegionDto(
                null,
                "New Region",
                "new.png",
                List.of()
        );

        RegionDto response = new RegionDto(
                5L,
                "New Region",
                "new.png",
                List.of()
        );

        when(regionService.createRegion(request)).thenReturn(response);

        mockMvc.perform(post("/api/regions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.regionId").value(5L))
                .andExpect(jsonPath("$.name").value("New Region"));
    }

    // ------------------------------------------------------
    // PUT /api/regions/{id}
    // ------------------------------------------------------
    @Test
    @WithMockUser(roles = "REGION_ADMIN")
    void shouldUpdateRegion() throws Exception {

        RegionDto request = new RegionDto(
                null,
                "Updated Region",
                "updated.png",
                List.of()
        );

        RegionDto response = new RegionDto(
                1L,
                "Updated Region",
                "updated.png",
                List.of()
        );

        when(regionService.updateRegion(1L, request)).thenReturn(response);

        mockMvc.perform(put("/api/regions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Region"));
    }

    // ------------------------------------------------------
    // DELETE /api/regions/{id}
    // ------------------------------------------------------
    @Test
    @WithMockUser(roles = "REGION_ADMIN")
    void shouldDeleteRegion() throws Exception {

        doNothing().when(regionService).deleteRegion(1L);

        mockMvc.perform(delete("/api/regions/1"))
                .andExpect(status().isNoContent());
    }

    // ------------------------------------------------------
    // GET /api/regions/{id}/municipalities
    // ------------------------------------------------------
    @Test
    @WithMockUser(roles = "REGION_ADMIN")
    void shouldGetMunicipalitiesOfRegion() throws Exception {

        List<MunicipalityDto> municipalities = List.of(
                new MunicipalityDto(10L, 1L, "Apeldoorn", null),
                new MunicipalityDto(11L, 1L, "Deventer", null)
        );

        when(regionService.getAllMunicipalitiesOfRegion(1L))
                .thenReturn(municipalities);

        mockMvc.perform(get("/api/regions/1/municipalities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].municipalityId").value("10"))
                .andExpect(jsonPath("$[0].regionId").value("1"))
                .andExpect(jsonPath("$[0].name").value("Apeldoorn"));
    }
}
