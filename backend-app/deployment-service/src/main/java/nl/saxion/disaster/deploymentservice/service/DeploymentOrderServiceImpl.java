package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.deploymentservice.client.ChatGroupCreateDTO;
import nl.saxion.disaster.deploymentservice.client.ChatGroupResponseDTO;
import nl.saxion.disaster.deploymentservice.client.ChatServiceClient;
import nl.saxion.disaster.deploymentservice.client.ChatUserAddDTO;
import nl.saxion.disaster.deploymentservice.client.IncidentBasicDTO;
import nl.saxion.disaster.deploymentservice.client.IncidentServiceClient;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.event.DeploymentEventPublisher;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentOrderMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import nl.saxion.disaster.shared.event.NewDeploymentRequestEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentOrderServiceImpl implements nl.saxion.disaster.deploymentservice.service.contract.DeploymentOrderService {

    private final DeploymentOrderRepository orderRepository;
    private final DeploymentOrderMapper orderMapper;
    private final DeploymentEventPublisher eventPublisher;
    private final ChatServiceClient chatServiceClient;
    private final IncidentServiceClient incidentServiceClient;

    @Override
    @Transactional
    public DeploymentOrderDTO createDeploymentOrder(DeploymentOrderCreateDTO dto) {

        // ------------------------------
        // 1) Build DeploymentOrder object
        // ------------------------------
        DeploymentOrder order = new DeploymentOrder();
        order.setIncidentId(dto.getIncidentId());
        order.setOrderedBy(dto.getOrderedBy());
        order.setOrderedAt(new Date());
        order.setIncidentSeverity(dto.getIncidentSeverity());
        order.setNotes(dto.getNotes());

        List<DeploymentRequest> requests = new ArrayList<>();
        Date currentDate = new Date();

        dto.getDeploymentRequests().forEach(request -> {
            DeploymentRequest deploymentRequest = new DeploymentRequest();
            deploymentRequest.setIncidentId(dto.getIncidentId());
            deploymentRequest.setDeploymentOrder(order);
            deploymentRequest.setRequestedBy(dto.getOrderedBy());
            deploymentRequest.setRequestedAt(currentDate);
            deploymentRequest.setTargetDepartmentId(request.getTargetDepartmentId());
            deploymentRequest.setPriority(dto.getIncidentSeverity());
            deploymentRequest.setRequestedUnitType(request.getRequestedUnitType());
            deploymentRequest.setRequestedQuantity(request.getRequestedQuantity());
            deploymentRequest.setStatus(DeploymentRequestStatus.PENDING);
            deploymentRequest.setNotes(dto.getNotes());

            requests.add(deploymentRequest);
        });

        order.setDeploymentRequests(requests);

        DeploymentOrder savedOrder = orderRepository.saveDeploymentOrder(order);

        // ------------------------------
        // 2) Create/Get Chat Group & Add User Responsible for Order
        // ------------------------------
        try {
            // Fetch incident details to get the title
            IncidentBasicDTO incident = incidentServiceClient.getIncidentById(savedOrder.getIncidentId());
            String chatTitle = incident.getTitle() != null ? incident.getTitle() : "Incident Response Team";
            
            ChatGroupCreateDTO chatGroupRequest = new ChatGroupCreateDTO(
                    savedOrder.getIncidentId(),
                    chatTitle
            );
            ChatGroupResponseDTO chatGroup = chatServiceClient.createChatGroup(chatGroupRequest);
            log.info("Chat group created/retrieved for incident {}: groupId={}", 
                    savedOrder.getIncidentId(), chatGroup.getChatGroupId());

            // Add the user responsible for the order
            chatServiceClient.addUserToGroup(
                    chatGroup.getChatGroupId(), 
                    new ChatUserAddDTO(savedOrder.getOrderedBy())
            );
            log.info("Added user {} (ordered by) to chat group {}", 
                    savedOrder.getOrderedBy(), chatGroup.getChatGroupId());

            // Add users handling each deployment request
            savedOrder.getDeploymentRequests().forEach(req -> {
                try {
                    chatServiceClient.addUserToGroup(
                            chatGroup.getChatGroupId(), 
                            new ChatUserAddDTO(req.getRequestedBy())
                    );
                    log.info("Added user {} (requested by) to chat group {}", 
                            req.getRequestedBy(), chatGroup.getChatGroupId());
                } catch (Exception e) {
                    log.warn("Failed to add user {} to chat group: {}", 
                            req.getRequestedBy(), e.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("Failed to create chat group or add users for incident {}: {}", 
                    savedOrder.getIncidentId(), e.getMessage());
        }

        // ------------------------------
        // 3) Publish events
        // ------------------------------
        savedOrder.getDeploymentRequests().forEach(req -> {

            NewDeploymentRequestEvent event = NewDeploymentRequestEvent.builder()
                    .deploymentRequestId(req.getRequestId())
                    .departmentId(req.getTargetDepartmentId())
                    .incidentId(savedOrder.getIncidentId())
                    .createdAt(Instant.now())
                    .description("A new deployment request was created for Incident #" + savedOrder.getIncidentId())
                    .build();

            eventPublisher.publish(event);
        });

        // ------------------------------
        // 4) Return response
        // ------------------------------
        return orderMapper.toDto(savedOrder);
    }


    @Override
    public List<DeploymentOrderDTO> getDeploymentOrdersByIncidentId(Long incidentId) {

        List<DeploymentOrder> orders =
                orderRepository.findDeploymentOrdersByIncidentId(incidentId);

        if (orders == null || orders.isEmpty()) {
            return Collections.emptyList();
        }

        return orders.stream()
                .map(orderMapper::toDto)
                .toList();
    }
}
