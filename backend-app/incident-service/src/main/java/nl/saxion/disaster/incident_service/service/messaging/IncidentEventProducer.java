package nl.saxion.disaster.incident_service.service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.shared.event.IncidentEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentEventProducer {

    private static final String TOPIC = "incidents";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendIncidentEvent(IncidentEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event).whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("IncidentEvent sent to Kafka (partition={}, offset={})",
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send IncidentEvent: {}", ex.getMessage(), ex);
                }
            });
        } catch (Exception e) {
            log.error("Error sending IncidentEvent: {}", e.getMessage(), e);
        }
    }
}
