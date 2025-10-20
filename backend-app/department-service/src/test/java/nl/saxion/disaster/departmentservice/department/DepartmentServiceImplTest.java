package nl.saxion.disaster.departmentservice.department;

import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.mapper.DepartmentMapper;
import nl.saxion.disaster.departmentservice.mapper.ResourceMapper;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import nl.saxion.disaster.departmentservice.service.DepartmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DepartmentServiceImplTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    private Department department;
    private Resource resource;
    private DepartmentDto departmentDto;
    private ResourceDto resourceDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // ----- Mock Resource -----
        resource = new Resource();
        resource.setResourceId(1L);
        resource.setName("Ambulance");
        resource.setDescription("Medical vehicle");
        resource.setAvailable(2);
        resource.setQuantity(3);
        resource.setResourceType(ResourceType.AMBULANCE);
        resource.setLatitude(52.37);
        resource.setLongitude(4.89);

        // ----- Mock Department -----
        department = new Department();
        department.setDepartmentId(10L);
        department.setMunicipalityId(100L);
        department.setName("Health Department");
        department.setResources(List.of(resource));
        resource.setDepartment(department);

        // ----- Create equivalent DTOs -----
        resourceDto = new ResourceMapper().toDto(resource);
        departmentDto = new DepartmentMapper(new ResourceMapper()).toDto(department);
    }

    @Test
    void testGetAllDepartments() {
        when(departmentRepository.findAllDepartments()).thenReturn(List.of(department));

        List<DepartmentSummaryDto> result = departmentService.getAllDepartments();

        assertEquals(1, result.size());
        assertEquals("Health Department", result.get(0).name());
        verify(departmentRepository, times(1)).findAllDepartments();
    }

    @Test
    void testGetDepartmentById() {
        when(departmentRepository.findDepartmentById(10L)).thenReturn(Optional.of(department));

        Optional<DepartmentDto> result = departmentService.getDepartmentById(10L);

        assertTrue(result.isPresent());
        assertEquals(10L, result.get().departmentId());
        assertEquals("Health Department", result.get().name());
        verify(departmentRepository, times(1)).findDepartmentById(10L);
    }

    @Test
    void testCreateDepartment() {
        when(departmentRepository.createDepartment(any(Department.class))).thenReturn(department);

        DepartmentDto created = departmentService.createDepartment(departmentDto);

        assertNotNull(created);
        assertEquals("Health Department", created.name());
        verify(departmentRepository, times(1)).createDepartment(any(Department.class));
    }

    @Test
    void testUpdateDepartment() {
        when(departmentRepository.updateDepartment(any(Department.class))).thenReturn(department);

        DepartmentDto updated = departmentService.updateDepartment(10L, departmentDto);

        assertNotNull(updated);
        assertEquals("Health Department", updated.name());
        verify(departmentRepository, times(1)).updateDepartment(any(Department.class));
    }

    @Test
    void testDeleteDepartment() {
        doNothing().when(departmentRepository).deleteDepartment(10L);

        departmentService.deleteDepartment(10L);

        verify(departmentRepository, times(1)).deleteDepartment(10L);
    }

    @Test
    void testGetDepartmentsByMunicipality() {
        when(departmentRepository.findDepartmentByMunicipalityId(100L)).thenReturn(List.of(department));

        List<DepartmentSummaryDto> result = departmentService.getDepartmentsByMunicipality(100L);

        assertEquals(1, result.size());
        DepartmentSummaryDto dto = result.get(0);
        assertEquals("Health Department", dto.name());

        verify(departmentRepository, times(1)).findDepartmentByMunicipalityId(100L);
    }
}
