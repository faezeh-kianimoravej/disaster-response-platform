package nl.saxion.disaster.departmentservice.resource;

import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.mapper.ResourceMapper;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import nl.saxion.disaster.departmentservice.repository.contract.ResourceRepository;
import nl.saxion.disaster.departmentservice.service.ResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResourceServiceImplTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ResourceMapper resourceMapper;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private Resource resource;
    private ResourceDto resourceDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        resource = new Resource();
        resource.setResourceId(1L);
        resource.setName("Fire Truck");
        resource.setDescription("Used for firefighting operations");
        resource.setAvailable(true);
        resource.setQuantity(2);
        resource.setResourceType(ResourceType.FIRE_TRUCK);
        resource.setLatitude(52.37);
        resource.setLongitude(4.89);

        resourceDto = new ResourceDto(
                1L,
                "Fire Truck",
                "Used for firefighting operations",
                true,
                2,
                "FIRE_TRUCK",
                5L,  // departmentId
                52.37,
                4.89,
                null
        );
    }

    @Test
    void testGetResourceById() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        Optional<ResourceDto> result = resourceService.getResourceById(1L);

        assertTrue(result.isPresent());
        assertEquals("Fire Truck", result.get().name());
        verify(resourceRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAvailableResources() {
        when(resourceRepository.findAvailable()).thenReturn(List.of(resource));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        List<ResourceDto> result = resourceService.getAvailableResources();

        assertEquals(1, result.size());
        assertTrue(result.get(0).available());
        verify(resourceRepository, times(1)).findAvailable();
    }

    @Test
    void testGetResourcesByType() {
        when(resourceRepository.findByType(ResourceType.FIRE_TRUCK)).thenReturn(List.of(resource));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        List<ResourceDto> result = resourceService.getResourcesByType(ResourceType.FIRE_TRUCK);

        assertEquals(1, result.size());
        assertEquals("FIRE_TRUCK", result.get(0).resourceType());
        verify(resourceRepository, times(1)).findByType(ResourceType.FIRE_TRUCK);
    }

    @Test
    void testGetResourcesByDepartment() {
        when(resourceRepository.findByDepartment(10L)).thenReturn(List.of(resource));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        List<ResourceDto> result = resourceService.getResourcesByDepartment(10L);

        assertEquals(1, result.size());
        verify(resourceRepository, times(1)).findByDepartment(10L);
    }

    @Test
    void testCreateResource() {
        when(resourceMapper.toEntity(resourceDto)).thenReturn(resource);
        when(resourceRepository.save(resource)).thenReturn(resource);
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        ResourceDto created = resourceService.createResource(resourceDto);

        assertNotNull(created);
        assertEquals("Fire Truck", created.name());
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    void testEditResource() {
        when(resourceMapper.toEntity(resourceDto)).thenReturn(resource);
        when(resourceRepository.edit(1L, resource)).thenReturn(resource);
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        ResourceDto edited = resourceService.editResource(1L, resourceDto);

        assertNotNull(edited);
        assertEquals(2, edited.quantity());
        verify(resourceRepository, times(1)).edit(1L, resource);
    }

    @Test
    void testDeleteResource() {
        doNothing().when(resourceRepository).deleteById(1L);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).deleteById(1L);
    }
}
