package nl.saxion.disaster.notification_service.mapper;

import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Safely maps between Notification entity and IncidentNotificationDto.
 * This mapper never returns null — always returns a valid default object.
 */
@Component
@Qualifier("incidentNotificationMapper")
public class IncidentNotificationMapper implements BaseMapper<Notification, IncidentNotificationDto> {

    public static final OffsetDateTime NOW = OffsetDateTime.now(ZoneOffset.UTC);

    @Override
    public IncidentNotificationDto toDto(Notification entity) {
        if (entity == null) return emptyDto();

        return new IncidentNotificationDto(
                safeLong(entity.getId()),
                safeLong(entity.getIncidentId()),
                safeLong(entity.getRegionId()),
                safeString(entity.getIncidentType()),
                entity.getNotificationType() != null
                        ? entity.getNotificationType()
                        : NotificationType.NEW_INCIDENT,
                entity.getNotificationStatus() != null
                        ? entity.getNotificationStatus()
                        : NotificationStatus.CREATED,
                safeString(entity.getMessage()),
                safeString(entity.getSeverity()),
                safeString(entity.getLocation()),
                safeString(entity.getCreatedBy()),
                entity.getCreatedAt(),
                entity.getReportedAt(),
                entity.getDeliveredAt()
        );
    }

    @Override
    public Notification toEntity(IncidentNotificationDto dto) {
        if (dto == null) return emptyEntity();

        Notification notification = new Notification();
        notification.setId(safeLong(dto.notificationID()));
        notification.setIncidentId(safeLong(dto.incidentID()));
        notification.setRegionId(safeLong(dto.regionId()));
        notification.setIncidentType(safeString(dto.incidentType()));
        notification.setNotificationType(
                dto.notificationType() != null ? dto.notificationType() : NotificationType.NEW_INCIDENT
        );
        notification.setNotificationStatus(
                dto.notificationStatus() != null ? dto.notificationStatus() : NotificationStatus.CREATED
        );
        notification.setMessage(safeString(dto.message()));
        notification.setSeverity(safeString(dto.Severity()));
        notification.setLocation(safeString(dto.Location()));
        notification.setCreatedBy(safeString(dto.createdBy()));
        notification.setCreatedAt(dto.createdAt());
        notification.setReportedAt(dto.reportedAt());
        notification.setDeliveredAt(dto.deliveredAt());
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

    // ---------- Helper methods ----------

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private Long safeLong(Long value) {
        return value == null ? 0L : value;
    }

    private IncidentNotificationDto emptyDto() {
        return new IncidentNotificationDto(
                0L,
                0L,
                0L,
                "",
                NotificationType.NEW_INCIDENT,
                NotificationStatus.CREATED,
                "", "", "", "",  // message, severity, location, createdBy
                OffsetDateTime.now(ZoneOffset.UTC),
                OffsetDateTime.now(ZoneOffset.UTC),
                null
        );
    }

    private Notification emptyEntity() {
        Notification notification = new Notification();
        notification.setId(0L);
        notification.setIncidentId(0L);
        notification.setRegionId(0L);
        notification.setIncidentType("");
        notification.setNotificationType(NotificationType.NEW_INCIDENT);
        notification.setNotificationStatus(NotificationStatus.CREATED);
        notification.setMessage("");
        notification.setSeverity("");
        notification.setLocation("");
        notification.setCreatedBy("");
        notification.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        notification.setReportedAt(OffsetDateTime.now(ZoneOffset.UTC));
        notification.setDeliveredAt(null);
        return notification;
    }
}
