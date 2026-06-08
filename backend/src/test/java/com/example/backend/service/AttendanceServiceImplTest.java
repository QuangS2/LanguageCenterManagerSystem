package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.attendance.dto.request.AttendanceRequest;
import com.example.backend.attendance.dto.response.AttendanceResponse;
import com.example.backend.attendance.mapper.AttendanceMapper;
import com.example.backend.attendance.model.Attendance;
import com.example.backend.attendance.repository.AttendanceRepository;
import com.example.backend.attendance.service.impl.AttendanceServiceImpl;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("AttendanceServiceImpl Test Suite")
public class AttendanceServiceImplTest {

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private AttendanceMapper attendanceMapper;

    // Các biến dùng chung cho toàn bộ test case
    private Student mockStudent;
    private Schedule mockSchedule;
    private Attendance mockAttendance;
    private AttendanceRequest mockRequest;
    private AttendanceResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockStudent = new Student();
        mockStudent.setId(1L);

        mockSchedule = new Schedule();
        mockSchedule.setId(1L);

        mockAttendance = new Attendance();
        mockAttendance.setId(1L);
        mockAttendance.setStudent(mockStudent);
        mockAttendance.setSchedule(mockSchedule);
        mockAttendance.setStatus("PRESENT");

        mockRequest = new AttendanceRequest();
        mockRequest.setStudentId(1L);
        mockRequest.setScheduleId(1L);
        mockRequest.setStatus("PRESENT");

        mockResponse = AttendanceResponse.builder().status("PRESENT").build();
    }

    @Test
    @DisplayName("Record attendance - student not found - throw ResourceNotFoundException")
    void recordAttendance_studentNotFound_throwResourceNotFoundException() {
        when(studentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.recordAttendance(mockRequest));

        verify(scheduleRepository, never()).findById(anyLong());
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Record attendance - schedule not found - throw ResourceNotFoundException")
    void recordAttendance_scheduleNotFound_throwResourceNotFoundException() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.recordAttendance(mockRequest));

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Record attendance - invalid status - throw IllegalArgumentException")
    void recordAttendance_invalidStatus_throwIllegalArgumentException() {
        mockRequest.setStatus("INVALID_STATUS");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(mockSchedule));

        assertThrows(IllegalArgumentException.class, () -> attendanceService.recordAttendance(mockRequest));

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Record attendance - Valid request - Return AttendanceResponse")
    void recordAttendance_ValidRequest_ReturnsAttendanceResponse() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(mockSchedule));
        when(attendanceMapper.toEntity(any(AttendanceRequest.class))).thenReturn(new Attendance());
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockAttendance);
        when(attendanceMapper.toResponse(any(Attendance.class))).thenReturn(mockResponse);

        AttendanceResponse result = attendanceService.recordAttendance(mockRequest);

        assertNotNull(result);
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Update attendance - attendance not found - throw ResourceNotFoundException")
    void updateAttendance_notFound_throwResourceNotFoundException() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.updateAttendance(1L, mockRequest));
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update attendance - invalid status - throw IllegalArgumentException")
    void updateAttendance_invalidStatus_throwIllegalArgumentException() {
        mockRequest.setStatus("INVALID_STATUS");
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(mockAttendance));

        assertThrows(IllegalArgumentException.class, () -> attendanceService.updateAttendance(1L, mockRequest));
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update attendance - Valid request - Return AttendanceResponse")
    void updateAttendance_ValidRequest_ReturnsAttendanceResponse() {
        mockRequest.setStatus("LATE"); // Test đổi trạng thái hợp lệ
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(mockAttendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockAttendance);
        when(attendanceMapper.toResponse(any(Attendance.class))).thenReturn(mockResponse);

        AttendanceResponse result = attendanceService.updateAttendance(1L, mockRequest);

        assertNotNull(result);
        assertEquals("LATE", mockAttendance.getStatus()); // Đảm bảo status đã được set mới trước khi save
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Get attendance by ID - not found - throw ResourceNotFoundException")
    void getAttendanceById_notFound_throwResourceNotFoundException() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.getAttendanceById(1L));
    }

    @Test
    @DisplayName("Get attendance by ID - Valid ID - Return AttendanceResponse")
    void getAttendanceById_ValidId_ReturnsAttendanceResponse() {
        when(attendanceRepository.findById(1L)).thenReturn(Optional.of(mockAttendance));
        when(attendanceMapper.toResponse(mockAttendance)).thenReturn(mockResponse);

        AttendanceResponse result = attendanceService.getAttendanceById(1L);

        assertNotNull(result);
        verify(attendanceMapper, times(1)).toResponse(mockAttendance);
    }

    @Test
    @DisplayName("Get attendance by Student ID - Return List of Responses")
    void getAttendanceByStudentId_ReturnsListOfResponses() {
        when(attendanceRepository.findByStudentId(1L)).thenReturn(List.of(mockAttendance, mockAttendance));
        when(attendanceMapper.toResponse(any(Attendance.class))).thenReturn(mockResponse);

        List<AttendanceResponse> result = attendanceService.getAttendanceByStudentId(1L);

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(attendanceRepository, times(1)).findByStudentId(1L);
    }

    @Test
    @DisplayName("Get attendance by Schedule ID - Return List of Responses")
    void getAttendanceByScheduleId_ReturnsListOfResponses() {
        when(attendanceRepository.findByScheduleId(1L)).thenReturn(List.of(mockAttendance));
        when(attendanceMapper.toResponse(any(Attendance.class))).thenReturn(mockResponse);

        List<AttendanceResponse> result = attendanceService.getAttendanceByScheduleId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(attendanceRepository, times(1)).findByScheduleId(1L);
    }

    @Test
    @DisplayName("Delete attendance - not found - throw ResourceNotFoundException")
    void deleteAttendance_notFound_throwResourceNotFoundException() {
        when(attendanceRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> attendanceService.deleteAttendance(1L));
        verify(attendanceRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Delete attendance - Valid ID - Calls deleteById")
    void deleteAttendance_ValidId_CallsDeleteById() {
        when(attendanceRepository.existsById(1L)).thenReturn(true);

        attendanceService.deleteAttendance(1L);

        verify(attendanceRepository, times(1)).deleteById(1L);
    }
}