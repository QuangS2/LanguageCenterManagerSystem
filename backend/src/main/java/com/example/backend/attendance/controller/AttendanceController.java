package com.example.backend.attendance.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.attendance.dto.request.AttendanceRequest;
import com.example.backend.attendance.dto.response.AttendanceResponse;
import com.example.backend.attendance.service.AttendanceService;
import com.example.backend.schedules.service.ScheduleService;
import com.example.backend.students.service.StudentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final StudentService studentService;
    private final ScheduleService scheduleService;

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<AttendanceResponse> recordAttendance(@Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.recordAttendance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(@PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT')")
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> getAttendanceById(@PathVariable Long id, Authentication authentication) {

        AttendanceResponse response = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STUDENT')")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByStudentId(@PathVariable Long studentId,
            Authentication authentication) {
        // if admin, teacher, access all
        if (hasAuthority(authentication, "ADMIN") || hasAuthority(authentication, "TEACHER")) {
            List<AttendanceResponse> response = attendanceService.getAttendanceByStudentId(studentId);
            return ResponseEntity.ok(response);
        }
        // if student, only access their own attendance
        if (hasAuthority(authentication, "STUDENT")) {
            if (studentService.getStudentId(authentication.getName()).equals(studentId)) {
                List<AttendanceResponse> response = attendanceService.getAttendanceByStudentId(studentId);
                return ResponseEntity.ok(response);
            }
        }
        throw new AccessDeniedException("You are not allowed to access other students' attendance");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByScheduleId(@PathVariable Long scheduleId,
            Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN") && hasAuthority(authentication, "TEACHER")) {
            if (!scheduleService.isTeacherOfSchedule(authentication.getName(), scheduleId)) {
                throw new AccessDeniedException("You are not allowed to access attendance of this schedule");
            }
        }
        List<AttendanceResponse> response = attendanceService.getAttendanceByScheduleId(scheduleId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id, Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN") && hasAuthority(authentication, "TEACHER")) {
            AttendanceResponse attendance = attendanceService.getAttendanceById(id);
            if (!scheduleService.isTeacherOfSchedule(authentication.getName(), attendance.getScheduleId())) {
                throw new AccessDeniedException("You are not allowed to delete attendance of this attendance");
            }
        }
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream().anyMatch(granted -> granted.getAuthority().equals(authority));
    }
}
