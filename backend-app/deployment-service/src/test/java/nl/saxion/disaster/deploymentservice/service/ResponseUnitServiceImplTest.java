package nl.saxion.disaster.deploymentservice.service;

import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import nl.saxion.disaster.deploymentservice.repository.contract.ResponseUnitRepository;
import nl.saxion.disaster.deploymentservice.mapper.ResponseUnitMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResponseUnitServiceImplTest {

    @Mock
    private ResponseUnitRepository responseUnitRepository;
    @Mock
    private ResponseUnitMapper responseUnitMapper;

    @InjectMocks
    private ResponseUnitServiceImpl responseUnitService;

    private ResponseUnit responseUnit;
    private ResponseUnitDTO responseUnitDTO;

    @BeforeEach
    void setUp() {
        responseUnit = new ResponseUnit();
        responseUnit.setUnitId(1L);
        responseUnit.setUnitName("Unit 1");
        responseUnit.setDepartmentId(10L);
        responseUnit.setUnitType(ResponseUnitType.FIRE_TRUCK);
        responseUnit.setStatus(ResponseUnitStatus.AVAILABLE);

        responseUnitDTO = new ResponseUnitDTO();
        responseUnitDTO.setUnitId(1L);
        responseUnitDTO.setUnitName("Unit 1");
        responseUnitDTO.setDepartmentId(10L);
        responseUnitDTO.setUnitType(ResponseUnitType.FIRE_TRUCK);
        responseUnitDTO.setStatus(ResponseUnitStatus.AVAILABLE);
    }

    @Test
    void testCreate() {
        ResponseUnitCreateDTO createDTO = new ResponseUnitCreateDTO();
        when(responseUnitRepository.save(any(ResponseUnit.class))).thenReturn(responseUnit);
        when(responseUnitMapper.toDto(responseUnit)).thenReturn(responseUnitDTO);
        ResponseUnitDTO result = responseUnitService.createResponseUnit(createDTO);
        assertThat(result).isNotNull();
        assertThat(result.getUnitId()).isEqualTo(1L);
        verify(responseUnitRepository).save(any(ResponseUnit.class));
    }

    @Test
    void testGetById() {
        when(responseUnitRepository.findById(1L)).thenReturn(Optional.of(responseUnit));
        when(responseUnitMapper.toDto(responseUnit)).thenReturn(responseUnitDTO);
        ResponseUnitDTO result = responseUnitService.getResponseUnitById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getUnitId()).isEqualTo(1L);
        verify(responseUnitRepository).findById(1L);
    }

    @Test
    void testGetByDepartmentId() {
        when(responseUnitRepository.findResponseUnitByDepartmentId(10L)).thenReturn(List.of(responseUnit));
        when(responseUnitMapper.toDto(responseUnit)).thenReturn(responseUnitDTO);
        List<ResponseUnitDTO> result = responseUnitService.getResponseUnitByDepartmentId(10L);
        assertThat(result).hasSize(1);
        verify(responseUnitRepository).findResponseUnitByDepartmentId(10L);
    }

    @Test
    void testGetAll() {
        when(responseUnitRepository.findAll()).thenReturn(List.of(responseUnit));
        when(responseUnitMapper.toDto(responseUnit)).thenReturn(responseUnitDTO);
        List<ResponseUnitDTO> result = responseUnitService.getAllResponseUnits();
        assertThat(result).hasSize(1);
        verify(responseUnitRepository).findAll();
    }

    @Test
    void testUpdate() {
        ResponseUnitCreateDTO updateDTO = new ResponseUnitCreateDTO();
        when(responseUnitRepository.findById(1L)).thenReturn(Optional.of(responseUnit));
        when(responseUnitRepository.save(any(ResponseUnit.class))).thenReturn(responseUnit);
        when(responseUnitMapper.toDto(responseUnit)).thenReturn(responseUnitDTO);
        ResponseUnitDTO result = responseUnitService.updateResponseUnit(1L, updateDTO);
        assertThat(result).isNotNull();
        assertThat(result.getUnitId()).isEqualTo(1L);
        verify(responseUnitRepository).save(any(ResponseUnit.class));
    }

    @Test
    void testDelete() {
        when(responseUnitRepository.existsById(1L)).thenReturn(true);
        doNothing().when(responseUnitRepository).deleteById(1L);
        responseUnitService.deleteResponseUnit(1L);
        verify(responseUnitRepository).deleteById(1L);
    }
}
