package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.account.model.User;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.mapper.ScheduleMapper;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.teachers.dto.request.TeacherRequest;
import com.example.backend.teachers.dto.response.TeacherResponse;
import com.example.backend.teachers.mapper.TeacherMapper;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.teachers.repository.TeacherRepository;
import com.example.backend.teachers.service.impl.TeacherServiceImpl;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceImplTest {
    @InjectMocks
    private TeacherServiceImpl teacherService;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TeacherMapper teacherMapper;
    @Mock
    private ScheduleMapper scheduleMapper;
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private ClassMapper classMapper;

    @Test
    @DisplayName("Create teacher - user not found - throw ResourceNotFoundException")
    void createTeacher_userNotFound_throwResourceNotFoundException() {
        TeacherRequest request = new TeacherRequest();
        request.setUserId(1L);
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> teacherService.createTeacher(request));
        verify(teacherRepository, never()).save(any());
    }

    @Test
    @DisplayName("Delete teacher - teacher not found - throw ResourceNotFoundException")
    void deleteTeacher_notFound_throwResourceNotFoundException() {
        when(teacherRepository.existsById(anyLong())).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> teacherService.deleteTeacher(1L));
        verify(teacherRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Get teacher by id - teacher not found - throw ResourceNotFoundException")
    void getTeacherId_teacherNotFound_throwResourceNotFoundException() {
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> teacherService.getTeacherById(1L));
        verify(teacherMapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Create teacher - valid request - return response")
    void createTeacher_validRequest_returnResponse() {
        TeacherRequest request = new TeacherRequest();
        request.setUserId(1L);
        request.setSpecialization("IELTS");

        User user = new User();
        user.setId(1L);
        user.setUsername("teacher1");

        Teacher teacher = new Teacher();
        teacher.setId(10L);
        teacher.setUser(user);
        teacher.setSpecialization("IELTS");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(teacherMapper.toEntity(request)).thenReturn(teacher);
        when(teacherRepository.save(teacher)).thenReturn(teacher);

        TeacherResponse response = teacherService.createTeacher(request);

        assertNotNull(response);
        assertEquals(10L, response.getTeacherId());
        verify(teacherRepository).save(teacher);
    }

    @Test
    @DisplayName("Update teacher - valid request - update specialization")
    void updateTeacher_validRequest_updateSpecialization() {
        TeacherRequest request = new TeacherRequest();
        request.setSpecialization("TOEIC");

        User user = new User();
        user.setId(3L);
        user.setUsername("teacher3");

        Teacher teacher = new Teacher();
        teacher.setId(7L);
        teacher.setUser(user);
        teacher.setSpecialization("OLD");

        when(teacherRepository.findById(7L)).thenReturn(Optional.of(teacher));
        when(teacherRepository.save(teacher)).thenReturn(teacher);

        TeacherResponse response = teacherService.updateTeacher(7L, request);

        assertEquals("TOEIC", teacher.getSpecialization());
        assertEquals(7L, response.getTeacherId());
        assertEquals("teacher3", response.getUserName());
    }

    @Test
    @DisplayName("Get teacher by id - valid id - return response")
    void getTeacherById_validId_returnResponse() {
        User user = new User();
        user.setId(2L);
        user.setUsername("teacher2");

        Teacher teacher = new Teacher();
        teacher.setId(5L);
        teacher.setUser(user);
        teacher.setSpecialization("GENERAL");

        when(teacherRepository.findById(5L)).thenReturn(Optional.of(teacher));

        TeacherResponse response = teacherService.getTeacherById(5L);

        assertEquals(5L, response.getTeacherId());
        assertEquals("teacher2", response.getUserName());
    }

    @Test
    @DisplayName("Get all teachers - return list")
    void getAllTeachers_returnList() {
        User user = new User();
        user.setId(1L);
        user.setUsername("teacher1");

        Teacher teacher = new Teacher();
        teacher.setId(1L);
        teacher.setUser(user);
        teacher.setSpecialization("GENERAL");

        when(teacherRepository.findAll()).thenReturn(List.of(teacher));

        List<TeacherResponse> result = teacherService.getAllTeachers();

        assertEquals(1, result.size());
        assertEquals("teacher1", result.get(0).getUserName());
    }

    @Test
    @DisplayName("Delete teacher - valid id - deleteById")
    void deleteTeacher_validId_deleteById() {
        when(teacherRepository.existsById(1L)).thenReturn(true);

        teacherService.deleteTeacher(1L);

        verify(teacherRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Get teacher id - valid username - return teacher id")
    void getTeacherId_validUsername_returnTeacherId() {
        User user = new User();
        user.setId(2L);
        user.setUsername("teacher2");

        Teacher teacher = new Teacher();
        teacher.setId(9L);

        when(userRepository.findByUsername("teacher2")).thenReturn(Optional.of(user));
        when(teacherRepository.findByUserId(2L)).thenReturn(Optional.of(teacher));

        Long teacherId = teacherService.getTeacherId("teacher2");

        assertEquals(9L, teacherId);
    }

    @Test
    @DisplayName("Get schedules by teacher id - return list")
    void getSchedulesByTeacherId_returnList() {
        Teacher teacher = new Teacher();
        teacher.setId(4L);

        Schedule schedule = new Schedule();
        schedule.setId(1L);

        when(teacherRepository.findById(4L)).thenReturn(Optional.of(teacher));
        when(scheduleRepository.findByClassEntityTeacherId(4L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toResponse(schedule)).thenReturn(ScheduleResponse.builder().scheduleId(1L).build());

        List<ScheduleResponse> result = teacherService.getSchedulesByTeacherId(4L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getScheduleId());
    }

    @Test
    @DisplayName("Get classes by teacher id - return list")
    void getClassesByTeacherId_returnList() {
        Teacher teacher = new Teacher();
        teacher.setId(4L);

        EntityClass classEntity = new EntityClass();
        classEntity.setId(3L);

        when(teacherRepository.findById(4L)).thenReturn(Optional.of(teacher));
        when(classRepository.findByTeacherId(4L)).thenReturn(List.of(classEntity));
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(3L).build());

        List<ClassResponse> result = teacherService.getClassesByTeacherId(4L);

        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getClassId());
    }

    @Test
    @DisplayName("Is teacher of class - repository returns true")
    void isTeacherOfClass_returnTrue() {
        when(classRepository.existsByIdAndTeacherUserUsername(1L, "teacherUser")).thenReturn(true);

        assertTrue(teacherService.isTeacherOfClass("teacherUser", 1L));
    }

}
