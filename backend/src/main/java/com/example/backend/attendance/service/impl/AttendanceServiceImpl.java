package com.example.backend.attendance.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.attendance.dto.request.AttendanceRequest;
import com.example.backend.attendance.dto.response.AttendanceResponse;
import com.example.backend.attendance.mapper.AttendanceMapper;
import com.example.backend.attendance.model.Attendance;
import com.example.backend.attendance.repository.AttendanceRepository;
import com.example.backend.attendance.service.AttendanceService;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final ScheduleRepository scheduleRepository;
    private final AttendanceMapper attendanceMapper;

    @Override
    @Transactional
    public AttendanceResponse recordAttendance(AttendanceRequest request) {
        // Validate student exists
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Validate schedule exists
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        // Validate status is valid (PRESENT, ABSENT, LATE)
        validateStatus(request.getStatus());

        // Create and save attendance
        Attendance attendance = attendanceMapper.toEntity(request);
        attendance.setStudent(student);
        attendance.setSchedule(schedule);

        return attendanceMapper.toResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));

        // Validate status is valid
        validateStatus(request.getStatus());

        // Update status
        attendance.setStatus(request.getStatus());

        return attendanceMapper.toResponse(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
        return attendanceMapper.toResponse(attendance);
    }

    @Override
    public List<AttendanceResponse> getAttendanceByStudentId(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        return attendances.stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    @Override
    public List<AttendanceResponse> getAttendanceByScheduleId(Long scheduleId) {
        List<Attendance> attendances = attendanceRepository.findByScheduleId(scheduleId);
        return attendances.stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance not found");
        }
        attendanceRepository.deleteById(id);
    }

    private void validateStatus(String status) {
        if (!status.equals("PRESENT") && !status.equals("ABSENT") && !status.equals("LATE")) {
            throw new IllegalArgumentException("Invalid status. Must be PRESENT, ABSENT, or LATE");
        }
    }
}
