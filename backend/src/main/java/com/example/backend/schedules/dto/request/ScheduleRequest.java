package com.example.backend.schedules.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ScheduleRequest {
    @NotNull(message = "Class ID is required")
    private Long classId;
    
    @NotNull(message = "Lesson date is required")
    private LocalDate lessonDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;
}
