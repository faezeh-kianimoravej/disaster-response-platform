package nl.saxion.disaster.deploymentservice.service;

import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentOrderMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeploymentOrderServiceImplTest {

    @Mock

    private DeploymentOrderRepository deploymentOrderRepository;
    private DeploymentOrderMapper deploymentOrderMapper;
    private DeploymentOrderServiceImpl deploymentOrderService;
    private DeploymentOrderCreateDTO createDTO;
    private DeploymentOrder deploymentOrder;
    private DeploymentOrderDTO deploymentOrderDTO;

    @BeforeEach
    void setUp() {
        deploymentOrderRepository = mock(DeploymentOrderRepository.class);
        deploymentOrderMapper = mock(DeploymentOrderMapper.class);
        deploymentOrderService = new DeploymentOrderServiceImpl(deploymentOrderRepository, deploymentOrderMapper);

        createDTO = new DeploymentOrderCreateDTO();
        createDTO.setIncidentId(100L);
        createDTO.setOrderedBy(10L);
        DeploymentOrderCreateDTO.Request req = new DeploymentOrderCreateDTO.Request();
        req.setTargetDepartmentId(20L);
        req.setRequestedUnitType(null);
        req.setRequestedQuantity(1);
        createDTO.setDeploymentRequests(java.util.Collections.singletonList(req));

        deploymentOrder = new DeploymentOrder();
        deploymentOrder.setDeploymentOrderId(1L);
        deploymentOrder.setIncidentId(100L);
        deploymentOrder.setOrderedBy(10L);

        deploymentOrderDTO = new DeploymentOrderDTO();
        deploymentOrderDTO.setDeploymentOrderId(1L);
        deploymentOrderDTO.setIncidentId(100L);
        deploymentOrderDTO.setOrderedBy(10L);
    }


    @Test
    void testCreate() {
        when(deploymentOrderRepository.save(any(DeploymentOrder.class))).thenReturn(deploymentOrder);
        when(deploymentOrderMapper.toDto(deploymentOrder)).thenReturn(deploymentOrderDTO);

        DeploymentOrderDTO result = deploymentOrderService.create(createDTO);
        assertThat(result).isNotNull();
        assertThat(result.getDeploymentOrderId()).isEqualTo(1L);
        verify(deploymentOrderRepository).save(any(DeploymentOrder.class));
    }


    @Test
    void testGetByIncidentId() {
        when(deploymentOrderRepository.findByIncidentId(100L)).thenReturn(Optional.of(deploymentOrder));
        when(deploymentOrderMapper.toDto(deploymentOrder)).thenReturn(deploymentOrderDTO);

        DeploymentOrderDTO result = deploymentOrderService.getByIncidentId(100L);
        assertThat(result).isNotNull();
        assertThat(result.getIncidentId()).isEqualTo(100L);
        verify(deploymentOrderRepository).findByIncidentId(100L);
    }
}
