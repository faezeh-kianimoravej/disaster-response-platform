package nl.saxion.disaster.deploymentservice.event;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.shared.event.NewDeploymentRequestEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeploymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "new-deployment-requests";

    public void publish(NewDeploymentRequestEvent event) {
        kafkaTemplate.send(TOPIC, event);
    }
}
