package nl.saxion.disaster.departmentservice.department;

import nl.saxion.disaster.departmentservice.client.ResourceClient;
import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.dto.ResourceSummaryDto;
import nl.saxion.disaster.departmentservice.exception.DepartmentNotFoundException;
import nl.saxion.disaster.departmentservice.mapper.DepartmentMapper;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import nl.saxion.disaster.departmentservice.service.DepartmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceImplTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ResourceClient resourceClient;

    @Mock
    private DepartmentMapper departmentMapper;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    private Department department;
    private DepartmentDto departmentDto;
    private DepartmentSummaryDto departmentSummaryDto;

    @BeforeEach
    void setUp() {
        department = Department.builder()
                .departmentId(1L)
                .name("Fire Department")
                .municipalityId(10L)
                .build();

        departmentDto = new DepartmentDto(1L, 10L, "Fire Department", null, List.of());
        departmentSummaryDto = new DepartmentSummaryDto(1L, 1L, 10L, "Fire Department", null);
    }

    @Test
    void testGetAllDepartments_ShouldReturnList() {
        when(departmentRepository.findAllDepartments()).thenReturn(List.of(department));
        when(departmentMapper.toSummaryDto(department)).thenReturn(departmentSummaryDto);

        List<DepartmentSummaryDto> result = departmentService.getAllDepartments();

        assertEquals(1, result.size());
        assertEquals("Fire Department", result.get(0).name());
        verify(departmentRepository, times(1)).findAllDepartments();
    }

    @Test
    void testGetDepartmentById_ShouldReturnOptional() {
        when(departmentRepository.findDepartmentById(1L)).thenReturn(Optional.of(department));
        when(departmentMapper.toDto(department)).thenReturn(departmentDto);

        Optional<DepartmentDto> result = departmentService.getDepartmentById(1L);

        assertTrue(result.isPresent());
        assertEquals("Fire Department", result.get().name());
        verify(departmentRepository, times(1)).findDepartmentById(1L);
    }

    @Test
    void testGetDepartmentById_NotFound_ShouldReturnEmptyOptional() {
        when(departmentRepository.findDepartmentById(99L)).thenReturn(Optional.empty());

        Optional<DepartmentDto> result = departmentService.getDepartmentById(99L);

        assertTrue(result.isEmpty());
        verify(departmentRepository, times(1)).findDepartmentById(99L);
    }

    @Test
    void testCreateDepartment_ShouldReturnCreatedDto() {
        when(departmentMapper.toEntity(departmentDto)).thenReturn(department);
        when(departmentRepository.createDepartment(department)).thenReturn(department);
        when(departmentMapper.toDto(department)).thenReturn(departmentDto);

        DepartmentDto result = departmentService.createDepartment(departmentDto);

        assertNotNull(result);
        assertEquals("Fire Department", result.name());
        verify(departmentRepository, times(1)).createDepartment(department);
    }

    @Test
    void testUpdateDepartment_ShouldReturnUpdatedDto() {
        when(departmentMapper.toEntity(departmentDto)).thenReturn(department);
        when(departmentRepository.updateDepartment(department)).thenReturn(department);
        when(departmentMapper.toDto(department)).thenReturn(departmentDto);

        DepartmentDto result = departmentService.updateDepartment(1L, departmentDto);

        assertNotNull(result);
        assertEquals("Fire Department", result.name());
        verify(departmentRepository, times(1)).updateDepartment(department);
    }

    @Test
    void testDeleteDepartment_ShouldInvokeRepository() {
        departmentService.deleteDepartment(1L);
        verify(departmentRepository, times(1)).deleteDepartment(1L);
    }

    @Test
    void testGetDepartmentsByMunicipality_ShouldReturnList() {
        when(departmentRepository.findDepartmentByMunicipalityId(10L)).thenReturn(List.of(department));
        when(departmentMapper.toSummaryDto(department)).thenReturn(departmentSummaryDto);

        List<DepartmentSummaryDto> result = departmentService.getDepartmentsByMunicipality(10L);

        assertEquals(1, result.size());
        assertEquals("Fire Department", result.get(0).name());
    }

    @Test
    void testGetResourcesOfDepartment_ShouldReturnList() {
        List<ResourceSummaryDto> mockResources = List.of(
                new ResourceSummaryDto(1L, "Truck", null )
        );

        when(departmentRepository.findDepartmentById(1L)).thenReturn(Optional.of(department));
        when(resourceClient.getResourcesByDepartment(1L)).thenReturn(mockResources);

        List<ResourceSummaryDto> result = departmentService.getResourcesOfDepartment(1L);

        assertEquals(1, result.size());
        assertEquals("Truck", result.get(0).name());
        verify(resourceClient, times(1)).getResourcesByDepartment(1L);
    }

    @Test
    void testGetResourcesOfDepartment_DepartmentNotFound_ShouldThrowException() {
        when(departmentRepository.findDepartmentById(99L)).thenReturn(Optional.empty());

        assertThrows(DepartmentNotFoundException.class, () ->
                departmentService.getResourcesOfDepartment(99L)
        );
    }
}
