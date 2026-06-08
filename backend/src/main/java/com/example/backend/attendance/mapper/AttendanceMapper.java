package com.example.backend.attendance.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.attendance.dto.request.AttendanceRequest;
import com.example.backend.attendance.dto.response.AttendanceResponse;
import com.example.backend.attendance.model.Attendance;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {
    Attendance toEntity(AttendanceRequest request);

    @Mapping(target = "attendanceId", source = "id")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "scheduleId", source = "schedule.id")
    AttendanceResponse toResponse(Attendance attendance);
}
