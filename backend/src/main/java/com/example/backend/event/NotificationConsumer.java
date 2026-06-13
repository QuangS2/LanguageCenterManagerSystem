package com.example.backend.event;

import com.example.backend.dto.event.EnrollmentEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationConsumer {

    @KafkaListener(topics = "enrollment-topic", groupId = "language-center-group")
    public void handleEnrollmentEvent(EnrollmentEvent event) {
        log.info("Received enrollment event from Kafka: {}", event);
        
        // Thực thi logic gửi Email/SMS thực tế ở đây
        sendEmailNotification(event);
    }

    private void sendEmailNotification(EnrollmentEvent event) {
        log.info("Sending confirmation email to student: {}", event.getStudentEmail());
        // Mock gửi mail bằng JavaMailSender hoặc 3rd party API (SendGrid, Mailgun...)
    }
}
