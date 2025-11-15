package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentRequestMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRequestRepository;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeploymentRequestServiceImpl implements DeploymentRequestService {

    private final DeploymentRequestRepository deploymentRequestRepository;
    private final DeploymentRequestMapper requestMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DeploymentRequestDTO> getDeploymentRequestsByDepartmentId(Long departmentId) {
        List<DeploymentRequest> deploymentRequests =
                deploymentRequestRepository.findDeploymentRequestByDepartmentId(departmentId);

        return deploymentRequests.stream()
                .map(requestMapper::toDto)
                .toList();
    }

}
