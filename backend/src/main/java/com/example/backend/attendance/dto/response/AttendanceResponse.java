package com.example.backend.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AttendanceResponse {
    private Long attendanceId;
    private Long studentId;
    private Long scheduleId;
    private String status;
}
