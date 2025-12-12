package nl.saxion.disaster.resourceservice.unit;

import nl.saxion.disaster.resourceservice.dto.ResourceDto;
import nl.saxion.disaster.resourceservice.mapper.ResourceMapper;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import nl.saxion.disaster.resourceservice.model.enums.ResourceKind;
import nl.saxion.disaster.resourceservice.model.enums.ResourceCategory;
import nl.saxion.disaster.resourceservice.model.enums.ResourceStatus;
import nl.saxion.disaster.resourceservice.repository.contract.ResourceRepository;
import nl.saxion.disaster.resourceservice.service.ResourceServiceImpl;
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
        resource.setDepartmentId(5L);
        resource.setName("Fire Truck");
        resource.setDescription("Used for firefighting operations");
        resource.setCategory(ResourceCategory.VEHICLE);
        resource.setResourceType(ResourceType.FIRE_TRUCK);
        resource.setResourceKind(ResourceKind.UNIQUE);
        resource.setStatus(ResourceStatus.AVAILABLE);
        resource.setTotalQuantity(10);
        resource.setAvailableQuantity(5);
        resource.setUnit("unit");
        resource.setIsTrackable(true);
        resource.setLatitude(52.37);
        resource.setLongitude(4.89);
        resource.setLastLocationUpdate(null);
        resource.setCurrentDeploymentId(null);
        resource.setDeployedQuantity(2);
        resource.setImage(null);

        resourceDto = new ResourceDto(
                1L,
                5L,
                "Fire Truck",
                "Used for firefighting operations",
                ResourceCategory.VEHICLE,
                ResourceType.FIRE_TRUCK,
                ResourceKind.UNIQUE,
                ResourceStatus.AVAILABLE,
                10,
                5,
                "unit",
                true,
                52.37,
                4.89,
                null,
                null,
                2,
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
        when(resourceRepository.findAllAvailableResources()).thenReturn(List.of(resource));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        // Act
        List<ResourceDto> result = resourceService.getAvailableResources();

        // Assert
        assertEquals(1, result.size());
        assertEquals(5, result.get(0).availableQuantity());
        verify(resourceRepository, times(1)).findAllAvailableResources();
    }

    @Test
    void testGetResourcesByType() {
        when(resourceRepository.findByType(ResourceType.FIRE_TRUCK)).thenReturn(List.of(resource));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);

        List<ResourceDto> result = resourceService.getResourcesByType(ResourceType.FIRE_TRUCK);

        assertEquals(1, result.size());
        assertEquals(ResourceType.FIRE_TRUCK, result.get(0).resourceType());
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
        assertEquals(2, edited.deployedQuantity());
        verify(resourceRepository, times(1)).edit(1L, resource);
    }

    @Test
    void testDeleteResource() {
        doNothing().when(resourceRepository).deleteById(1L);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).deleteById(1L);
    }

    @Test
    void testGetResourceBasicInfoById_WhenResourceExists() {
        // Arrange
        resource.setDepartmentId(10L);
        resource.setName("Fire Truck");

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        // Act
        var result = resourceService.getResourceBasicInfoById(1L);

        // Assert
        assertTrue(result.isPresent(), "Expected a non-empty Optional result");
        var dto = result.get();

        assertEquals(resource.getResourceId(), dto.id());
        assertEquals(resource.getName(), dto.name());
        assertEquals(resource.getResourceType(), dto.resourceType());
        assertEquals(resource.getDepartmentId(), dto.departmentId());

        verify(resourceRepository, times(1)).findById(1L);
    }

    @Test
    void testGetResourceBasicInfoById_WhenResourceNotFound() {
        // Arrange
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        var result = resourceService.getResourceBasicInfoById(999L);

        // Assert
        assertTrue(result.isEmpty(), "Expected an empty Optional result");
        verify(resourceRepository, times(1)).findById(999L);
    }

    @Test
    void testGetAvailableResourcesByDepartment() {
        // Setup two resources with different departmentIds
        Resource resource2 = new Resource();
        resource2.setResourceId(2L);
        resource2.setDepartmentId(99L);
        resource2.setName("Ambulance");
        resource2.setDescription("Medical transport");
        resource2.setCategory(ResourceCategory.VEHICLE);
        resource2.setResourceType(ResourceType.AMBULANCE);
        resource2.setResourceKind(ResourceKind.UNIQUE);
        resource2.setStatus(ResourceStatus.AVAILABLE);
        resource2.setTotalQuantity(3);
        resource2.setAvailableQuantity(2);
        resource2.setUnit("unit");
        resource2.setIsTrackable(true);
        resource2.setLatitude(51.0);
        resource2.setLongitude(5.0);
        resource2.setLastLocationUpdate(null);
        resource2.setCurrentDeploymentId(null);
        resource2.setDeployedQuantity(1);
        resource2.setImage(null);

        ResourceDto resourceDto2 = new ResourceDto(
                2L,
                99L,
                "Ambulance",
                "Medical transport",
                ResourceCategory.VEHICLE,
                ResourceType.AMBULANCE,
                ResourceKind.UNIQUE,
                ResourceStatus.AVAILABLE,
                3,
                2,
                "unit",
                true,
                51.0,
                5.0,
                null,
                null,
                1,
                null
        );

        when(resourceRepository.findAllAvailableResources()).thenReturn(List.of(resource, resource2));
        when(resourceMapper.toDto(resource)).thenReturn(resourceDto);
        when(resourceMapper.toDto(resource2)).thenReturn(resourceDto2);

        // Only resource with departmentId 5L should be returned
        List<ResourceDto> result = resourceService.getAvailableResourcesByDepartment(5L);
        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).departmentId());
        assertEquals("Fire Truck", result.get(0).name());
    }

    @Test
    void testGetResourceLocationById_WhenResourceExists() {
        resource.setLatitude(52.37);
        resource.setLongitude(4.89);
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        var result = resourceService.getResourceLocationById(1L);
        assertTrue(result.isPresent());
        var dto = result.get();
        assertEquals(resource.getResourceId(), dto.resourceId());
        assertEquals(resource.getLatitude(), dto.latitude());
        assertEquals(resource.getLongitude(), dto.longitude());
    }

    @Test
    void testGetResourceLocationById_WhenResourceNotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());
        var result = resourceService.getResourceLocationById(999L);
        assertTrue(result.isEmpty());
    }

}
