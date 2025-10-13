package nl.saxion.disaster.departmentservice.resource;

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

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private Resource resource;

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
    }

    @Test
    void testGetResourceById() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        Optional<Resource> result = resourceService.getResourceById(1L);

        assertTrue(result.isPresent());
        assertEquals("Fire Truck", result.get().getName());
        verify(resourceRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAvailableResources() {
        when(resourceRepository.findAvailable()).thenReturn(List.of(resource));

        List<Resource> result = resourceService.getAvailableResources();

        assertEquals(1, result.size());
        assertTrue(result.get(0).isAvailable());
        verify(resourceRepository, times(1)).findAvailable();
    }

    @Test
    void testGetResourcesByType() {
        when(resourceRepository.findByType(ResourceType.FIRE_TRUCK)).thenReturn(List.of(resource));

        List<Resource> result = resourceService.getResourcesByType(ResourceType.FIRE_TRUCK);

        assertEquals(1, result.size());
        assertEquals(ResourceType.FIRE_TRUCK, result.get(0).getResourceType());
        verify(resourceRepository, times(1)).findByType(ResourceType.FIRE_TRUCK);
    }

    @Test
    void testGetResourcesByDepartment() {
        when(resourceRepository.findByDepartment(10L)).thenReturn(List.of(resource));

        List<Resource> result = resourceService.getResourcesByDepartment(10L);

        assertEquals(1, result.size());
        verify(resourceRepository, times(1)).findByDepartment(10L);
    }

    @Test
    void testCreateResource() {
        when(resourceRepository.save(resource)).thenReturn(resource);

        Resource created = resourceService.createResource(resource);

        assertNotNull(created);
        assertEquals("Fire Truck", created.getName());
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    void testEditResource() {
        when(resourceRepository.edit(1L, resource)).thenReturn(resource);

        Resource edited = resourceService.editResource(1L, resource);

        assertNotNull(edited);
        assertEquals(2, edited.getQuantity());
        verify(resourceRepository, times(1)).edit(1L, resource);
    }

    @Test
    void testDeleteResource() {
        doNothing().when(resourceRepository).deleteById(1L);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).deleteById(1L);
    }
}
