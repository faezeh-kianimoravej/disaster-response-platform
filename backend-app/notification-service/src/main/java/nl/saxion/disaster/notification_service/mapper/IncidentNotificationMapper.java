package nl.saxion.disaster.notification_service.mapper;

import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Maps between Notification entity and IncidentNotificationDto (frontend DTO).
 * Returns null if the input is null.
 */
@Component
@Qualifier("incidentNotificationMapper")
public class IncidentNotificationMapper implements BaseMapper<Notification, IncidentNotificationDto> {

    @Override
    public IncidentNotificationDto toDto(Notification entity) {
        if (entity == null) return null;
        return new IncidentNotificationDto(
            entity.getId(),
            entity.getIncidentId(),
            entity.getRegionId(),
            "New Incident - " + entity.getTitle(),
            entity.getDescription(),
            entity.getNotificationType(),
            entity.getCreatedAt(),
            entity.isRead()
        );
    }

    @Override
    public Notification toEntity(IncidentNotificationDto dto) {
        if (dto == null) throw new IllegalArgumentException("IncidentNotificationDto cannot be null");
        Notification notification = new Notification();
        notification.setIncidentId(dto.incidentId());
        notification.setRegionId(dto.regionId());
        notification.setTitle(dto.title());
        notification.setDescription(dto.description());
        notification.setNotificationType(dto.notificationType());
        notification.setCreatedAt(dto.createdAt());
        notification.setRead(dto.read());
        return notification;
    }

    // ---------- List conversions ----------

    public List<IncidentNotificationDto> toDtoList(List<Notification> entities) {
        if (entities == null || entities.isEmpty()) return Collections.emptyList();
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<Notification> toEntityList(List<IncidentNotificationDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return Collections.emptyList();
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
