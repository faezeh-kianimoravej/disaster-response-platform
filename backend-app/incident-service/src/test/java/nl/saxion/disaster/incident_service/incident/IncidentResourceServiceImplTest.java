package nl.saxion.disaster.incident_service.incident;

import nl.saxion.disaster.incident_service.client.DepartmentClient;
import nl.saxion.disaster.incident_service.client.MunicipalityClient;
import nl.saxion.disaster.incident_service.client.ResourceClient;
import nl.saxion.disaster.incident_service.dto.DepartmentBasicDto;
import nl.saxion.disaster.incident_service.dto.IncidentResourceResponseDto;
import nl.saxion.disaster.incident_service.dto.MunicipalityBasicDto;
import nl.saxion.disaster.incident_service.dto.ResourceBasicDto;
import nl.saxion.disaster.incident_service.model.entity.IncidentResource;
import nl.saxion.disaster.incident_service.repository.contract.IncidentResourceRepository;
import nl.saxion.disaster.incident_service.service.IncidentResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class IncidentResourceServiceImplTest {

    @Mock
    private IncidentResourceRepository repository;

    @Mock
    private ResourceClient resourceClient;

    @Mock
    private DepartmentClient departmentClient;

    @Mock
    private MunicipalityClient municipalityClient;

    @InjectMocks
    private IncidentResourceServiceImpl incidentResourceService;

    private IncidentResource incidentResource;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        incidentResource = new IncidentResource();
        incidentResource.setIncidentId(1L);
        incidentResource.setResourceId(101L);
        incidentResource.setQuantity(3);
    }

    @Test
    void testGetResourcesByIncidentId_ReturnsEnrichedResponse() {
        // Arrange
        when(repository.findByIncidentId(1L)).thenReturn(List.of(incidentResource));

        // Mock resource-service call
        ResourceBasicDto resourceBasicDto = new ResourceBasicDto(
                101L,
                "Fire Truck",
                "FIRE_TRUCK",
                201L
        );
        when(resourceClient.getResourceBasicInfoById(101L)).thenReturn(resourceBasicDto);

        // Mock department-service call
        DepartmentBasicDto departmentBasicDto = new DepartmentBasicDto(
                201L,
                "Deventer Fire Dept",
                301L
        );
        when(departmentClient.getDepartmentBasicInfoById(201L)).thenReturn(departmentBasicDto);

        // Mock municipality-service call
        MunicipalityBasicDto municipalityBasicDto = new MunicipalityBasicDto(
                301L,
                "Deventer"
        );
        when(municipalityClient.getMunicipalityBasicInfoById(301L)).thenReturn(municipalityBasicDto);

        // Act
        List<IncidentResourceResponseDto> result = incidentResourceService.getResourcesByIncidentId(1L);

        // Assert
        assertEquals(1, result.size());
        IncidentResourceResponseDto dto = result.get(0);

        assertEquals(101L, dto.resourceId());
        assertEquals("Fire Truck", dto.name());
        assertEquals("FIRE_TRUCK", dto.resourceType());
        assertEquals("Deventer Fire Dept", dto.department());
        assertEquals("Deventer", dto.municipality());
        assertEquals(3, dto.quantity());

        // Verify client calls
        verify(resourceClient, times(1)).getResourceBasicInfoById(101L);
        verify(departmentClient, times(1)).getDepartmentBasicInfoById(201L);
        verify(municipalityClient, times(1)).getMunicipalityBasicInfoById(301L);
        verify(repository, times(1)).findByIncidentId(1L);
    }

    @Test
    void testGetResourcesByIncidentId_WhenNoResourcesFound() {
        // Arrange
        when(repository.findByIncidentId(2L)).thenReturn(List.of());

        // Act
        List<IncidentResourceResponseDto> result = incidentResourceService.getResourcesByIncidentId(2L);

        // Assert
        assertTrue(result.isEmpty());
        verify(repository, times(1)).findByIncidentId(2L);
        verifyNoInteractions(resourceClient, departmentClient, municipalityClient);
    }

    @Test
    void testGetActiveAllocationsForResources() {
        // Arrange
        List<Long> resourceIds = List.of(101L, 102L);
        Map<Long, Integer> mockAllocations = Map.of(101L, 3, 102L, 1);
        when(repository.findActiveAllocations(resourceIds)).thenReturn(mockAllocations);

        // Act
        Map<Long, Integer> result = incidentResourceService.getActiveAllocationsForResources(resourceIds);

        // Assert
        assertEquals(2, result.size());
        assertEquals(3, result.get(101L));
        assertEquals(1, result.get(102L));
        verify(repository, times(1)).findActiveAllocations(resourceIds);
    }
}
