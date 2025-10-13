package nl.saxion.disaster.departmentservice.department;

import nl.saxion.disaster.departmentservice.model.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.model.dto.ResourceDto;
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

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        resource = new Resource();
        resource.setResourceId(1L);
        resource.setName("Ambulance");
        resource.setDescription("Medical vehicle");
        resource.setAvailable(true);
        resource.setQuantity(3);
        resource.setResourceType(ResourceType.AMBULANCE);
        resource.setLatitude(52.37);
        resource.setLongitude(4.89);

        department = new Department();
        department.setDepartmentId(10L);
        department.setMunicipalityId(100L);
        department.setName("Health Department");
        department.setResources(List.of(resource));
        resource.setDepartment(department);
    }

    @Test
    void testGetAllDepartments() {
        when(departmentRepository.findAllDepartments()).thenReturn(List.of(department));

        List<Department> result = departmentService.getAllDepartments();

        assertEquals(1, result.size());
        assertEquals("Health Department", result.get(0).getName());
        verify(departmentRepository, times(1)).findAllDepartments();
    }

    @Test
    void testGetDepartmentById() {
        when(departmentRepository.findDepartmentById(10L)).thenReturn(Optional.of(department));

        Optional<Department> result = departmentService.getDepartmentById(10L);

        assertTrue(result.isPresent());
        assertEquals(10L, result.get().getDepartmentId());
        verify(departmentRepository, times(1)).findDepartmentById(10L);
    }

    @Test
    void testCreateDepartment() {
        when(departmentRepository.createDepartment(department)).thenReturn(department);

        Department created = departmentService.createDepartment(department);

        assertNotNull(created);
        assertEquals("Health Department", created.getName());
        verify(departmentRepository, times(1)).createDepartment(department);
    }

    @Test
    void testUpdateDepartment() {
        when(departmentRepository.updateDepartment(department)).thenReturn(department);

        Department updated = departmentService.updateDepartment(10L, department);

        assertNotNull(updated);
        assertEquals("Health Department", updated.getName());
        verify(departmentRepository, times(1)).updateDepartment(department);
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

        List<DepartmentDto> result = departmentService.getDepartmentsByMunicipality(100L);

        assertEquals(1, result.size());
        DepartmentDto dto = result.get(0);
        assertEquals("Health Department", dto.departmentName());
        assertEquals(1, dto.resourceDtoList().size());

        ResourceDto resourceDto = dto.resourceDtoList().get(0);
        assertEquals("Ambulance", resourceDto.resourceName());
        assertEquals("Medical vehicle", resourceDto.description());

        verify(departmentRepository, times(1)).findDepartmentByMunicipalityId(100L);
    }
}
