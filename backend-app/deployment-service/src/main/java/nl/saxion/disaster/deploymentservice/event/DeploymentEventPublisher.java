package nl.saxion.disaster.deploymentservice.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.shared.event.NewDeploymentRequestEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeploymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "new-deployment-requests";

    public void publish(NewDeploymentRequestEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event).whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("DeploymentEvent sent to Kafka (partition={}, offset={})",
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send DeploymentEvent: {}", ex.getMessage(), ex);
                }
            });
        } catch (Exception e) {
            log.error("Error sending DeploymentEvent: {}", e.getMessage(), e);
        }
    }
}
