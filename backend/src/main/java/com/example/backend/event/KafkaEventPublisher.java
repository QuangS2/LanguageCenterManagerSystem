package com.example.backend.event;

import com.example.backend.dto.event.EnrollmentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String ENROLLMENT_TOPIC = "enrollment-topic";

    public void publishEnrollmentEvent(EnrollmentEvent event) {
        log.info("Publishing enrollment event to Kafka: {}", event);
        kafkaTemplate.send(ENROLLMENT_TOPIC, String.valueOf(event.getEnrollmentId()), event);
    }
}
