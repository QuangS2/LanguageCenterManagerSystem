package com.example.backend.teachers.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class TeacherRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotBlank(message = "Specialization is required")
    private String specialization;
}
