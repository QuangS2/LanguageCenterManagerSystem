package com.example.backend.classes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClassRequest {

    @NotBlank(message = "Class name is required")
    @Size(min = 2, max = 100, message = "Class name must be between 2 and 100 characters")
    private String className;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    // Optional registration window for this class
    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;

    @NotNull(message = "Max students is required")
    private Integer maxStudents;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String status;
}