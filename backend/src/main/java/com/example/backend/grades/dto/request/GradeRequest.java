package com.example.backend.grades.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class GradeRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Class ID is required")
    private Long classId;

    @NotNull(message = "Midterm grade is required")
    @DecimalMin(value = "0", message = "Midterm grade must be >= 0")
    @DecimalMax(value = "10", message = "Midterm grade must be <= 10")
    private BigDecimal midtermGrade;

    @NotNull(message = "Final grade is required")
    @DecimalMin(value = "0", message = "Final grade must be >= 0")
    @DecimalMax(value = "10", message = "Final grade must be <= 10")
    private BigDecimal finalGrade;

    private String comment;
}
