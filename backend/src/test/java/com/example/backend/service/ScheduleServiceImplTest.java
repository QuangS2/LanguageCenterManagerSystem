package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.dto.request.ScheduleRequest;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.mapper.ScheduleMapper;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.schedules.service.impl.ScheduleServiceImpl;

@ExtendWith(MockitoExtension.class)
public class ScheduleServiceImplTest {

    @InjectMocks
    private ScheduleServiceImpl scheduleService;
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private ScheduleMapper scheduleMapper;

    private ScheduleRequest scheduleRequest;
    private Schedule schedule;
    private EntityClass entityClass;
    private ScheduleResponse scheduleResponse;

    @BeforeEach
    void setUp() {
        entityClass = new EntityClass();
        entityClass.setId(1L);

        scheduleRequest = new ScheduleRequest();
        scheduleRequest.setClassId(1L);
        scheduleRequest.setStartTime(LocalTime.of(10, 0));
        scheduleRequest.setEndTime(LocalTime.of(11, 0));

        schedule = new Schedule();
        schedule.setId(1L);
        schedule.setClassEntity(entityClass);
        schedule.setStartTime(LocalTime.of(10, 0));
        schedule.setEndTime(LocalTime.of(11, 0));

        scheduleResponse = ScheduleResponse.builder().build();
    }

    @Test
    @DisplayName("Create schedule - Valid request - Success")
    void createSchedule_ValidRequest_Success() {
        // Arrange
        when(classRepository.findById(1L)).thenReturn(Optional.of(entityClass));
        when(scheduleMapper.toEntity(any(ScheduleRequest.class))).thenReturn(schedule);
        when(scheduleRepository.save(any(Schedule.class))).thenReturn(schedule);
        when(scheduleMapper.toResponse(any(Schedule.class))).thenReturn(scheduleResponse);

        // Act
        ScheduleResponse result = scheduleService.createSchedule(scheduleRequest);

        // Assert
        assertNotNull(result);
        verify(classRepository, times(1)).findById(1L);
        verify(scheduleRepository, times(1)).save(any(Schedule.class));
    }

    @Test
    @DisplayName("Create schedule - Class not found - Throw ResourceNotFoundException")
    void createSchedule_ClassNotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(classRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> scheduleService.createSchedule(scheduleRequest));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create schedule - Start time after end time - Throw IllegalArgumentException")
    void createSchedule_StartAfterEnd_ThrowIllegalArgumentException() {
        // Arrange
        scheduleRequest.setStartTime(LocalTime.of(14, 0));
        scheduleRequest.setEndTime(LocalTime.of(13, 0));
        when(classRepository.findById(1L)).thenReturn(Optional.of(entityClass));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> scheduleService.createSchedule(scheduleRequest));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update schedule - Valid request - Success")
    void updateSchedule_ValidRequest_Success() {
        // Arrange
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(scheduleRepository.save(any(Schedule.class))).thenReturn(schedule);
        when(scheduleMapper.toResponse(any(Schedule.class))).thenReturn(scheduleResponse);

        // Act
        ScheduleResponse result = scheduleService.updateSchedule(1L, scheduleRequest);

        // Assert
        assertNotNull(result);
        verify(scheduleRepository, times(1)).findById(1L);
        verify(scheduleRepository, times(1)).save(any(Schedule.class));
    }

    @Test
    @DisplayName("Update schedule - Not found - Throw ResourceNotFoundException")
    void updateSchedule_NotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(scheduleRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> scheduleService.updateSchedule(1L, scheduleRequest));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update schedule - Start time after end time - Throw IllegalArgumentException")
    void updateSchedule_StartAfterEnd_ThrowIllegalArgumentException() {
        // Arrange
        scheduleRequest.setStartTime(LocalTime.of(14, 0));
        scheduleRequest.setEndTime(LocalTime.of(13, 0));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> scheduleService.updateSchedule(1L, scheduleRequest));
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get schedule by ID - Valid ID - Success")
    void getScheduleById_ValidId_Success() {
        // Arrange
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(scheduleMapper.toResponse(schedule)).thenReturn(scheduleResponse);

        // Act
        ScheduleResponse result = scheduleService.getScheduleById(1L);

        // Assert
        assertNotNull(result);
        verify(scheduleRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Get schedule by ID - Not found - Throw ResourceNotFoundException")
    void getScheduleById_NotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(scheduleRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> scheduleService.getScheduleById(1L));
        verify(scheduleMapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Get schedules by Class ID - Success")
    void getSchedulesByClassId_Success() {
        // Arrange
        when(scheduleRepository.findByClassEntityId(1L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toResponse(any())).thenReturn(scheduleResponse);

        // Act
        List<ScheduleResponse> result = scheduleService.getSchedulesByClassId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(scheduleRepository, times(1)).findByClassEntityId(1L);
    }

    @Test
    @DisplayName("Get schedules by Teacher ID - Success")
    void getSchedulesByTeacherId_Success() {
        // Arrange
        when(scheduleRepository.findByClassEntityTeacherId(1L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toResponse(any())).thenReturn(scheduleResponse);

        // Act
        List<ScheduleResponse> result = scheduleService.getSchedulesByTeacherId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(scheduleRepository, times(1)).findByClassEntityTeacherId(1L);
    }

    @Test
    @DisplayName("Delete schedule - Valid ID - Success")
    void deleteSchedule_ValidId_Success() {
        // Arrange
        when(scheduleRepository.existsById(1L)).thenReturn(true);

        // Act
        scheduleService.deleteSchedule(1L);

        // Assert
        verify(scheduleRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Delete schedule - Not found - Throw ResourceNotFoundException")
    void deleteSchedule_NotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(scheduleRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> scheduleService.deleteSchedule(1L));
        verify(scheduleRepository, never()).deleteById(anyLong());
    }

    // ================== CHECK TEACHER OF SCHEDULE TESTS ==================

    @Test
    @DisplayName("Check if teacher owns schedule - Return true when owned")
    void isTeacherOfSchedule_ReturnTrueWhenOwned() {
        // Arrange
        when(scheduleRepository.existsByIdAndClassEntityTeacherUserUsername(1L, "teacher1")).thenReturn(true);

        // Act
        boolean result = scheduleService.isTeacherOfSchedule("teacher1", 1L);

        // Assert
        assertTrue(result);
        verify(scheduleRepository, times(1)).existsByIdAndClassEntityTeacherUserUsername(1L, "teacher1");
    }

    @Test
    @DisplayName("Check if teacher owns schedule - Return false when not owned")
    void isTeacherOfSchedule_ReturnFalseWhenNotOwned() {
        // Arrange
        when(scheduleRepository.existsByIdAndClassEntityTeacherUserUsername(1L, "teacher1")).thenReturn(false);

        // Act
        boolean result = scheduleService.isTeacherOfSchedule("teacher1", 1L);

        // Assert
        assertFalse(result);
        verify(scheduleRepository, times(1)).existsByIdAndClassEntityTeacherUserUsername(1L, "teacher1");
    }
}