package com.example.backend.schedules.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleResponse {
    private Long scheduleId;
    private Long classId;
    private Long classEntityId;
    private LocalDate lessonDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomNumber;
}
