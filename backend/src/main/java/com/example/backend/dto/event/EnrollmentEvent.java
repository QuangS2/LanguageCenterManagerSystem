package com.example.backend.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentEvent {
    private Long enrollmentId;
    private String studentEmail;
    private String studentName;
    private String className;
    private String courseName;
    private Double amount;
    private String status; // e.g., "SUCCESS", "PENDING"
}
