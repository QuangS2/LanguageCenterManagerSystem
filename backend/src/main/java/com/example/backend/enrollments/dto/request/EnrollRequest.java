package com.example.backend.enrollments.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class EnrollRequest {
    @NotNull(message = "Class ID is required")
    private Long classId;
    @NotNull(message = "Student ID is required")
    private Long studentId;
}
