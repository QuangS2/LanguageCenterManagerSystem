package com.example.backend.attendance.service;

import com.example.backend.attendance.dto.request.AttendanceRequest;
import com.example.backend.attendance.dto.response.AttendanceResponse;
import java.util.List;

public interface AttendanceService {
    AttendanceResponse recordAttendance(AttendanceRequest request);

    AttendanceResponse updateAttendance(Long id, AttendanceRequest request);

    AttendanceResponse getAttendanceById(Long id);

    List<AttendanceResponse> getAttendanceByStudentId(Long studentId);

    List<AttendanceResponse> getAttendanceByScheduleId(Long scheduleId);

    void deleteAttendance(Long id);
}
