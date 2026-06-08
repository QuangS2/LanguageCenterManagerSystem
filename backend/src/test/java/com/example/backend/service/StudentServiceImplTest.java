package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
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
import com.example.backend.enrollments.model.Enrollment;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.mapper.ScheduleMapper;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;
import com.example.backend.students.service.impl.StudentServiceImpl;

@ExtendWith(MockitoExtension.class)
public class StudentServiceImplTest {
    @InjectMocks
    private StudentServiceImpl studentService;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private StudentMapper studentMapper;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private ScheduleMapper scheduleMapper;
    @Mock
    private ClassMapper classMapper;

    private User mockUser;
    private Student mockStudent;
    private List<Schedule> mockSchedules;
    private Enrollment mockEnrollment;
    private EntityClass mockClass;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");

        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(mockUser);

        mockEnrollment = new Enrollment();
        mockEnrollment.setStudent(mockStudent);

        mockClass = new EntityClass();
        mockClass.setId(10L);

        mockSchedules = new ArrayList<>();
        Schedule schedule1 = new Schedule();
        schedule1.setId(1L);
        Schedule schedule2 = new Schedule();
        schedule2.setId(2L);
        mockSchedules.add(schedule1);
        mockSchedules.add(schedule2);
    }

    @Test
    @DisplayName("getStudentId - Username not exists - Throw RuntimeException")
    void getStudentId_UsernameNotExists_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findByUsername("other.username")).thenReturn(Optional.empty());
        // Act
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            studentService.getStudentId("other.username");
        });
        // Assert
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("getStudentId - Student not exists - Throw RuntimeException")
    void getStudentId_StudentNotExists_ThrowsRuntimeException() {
        // Arrange
        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(studentRepository.findByUserId(mockUser.getId())).thenReturn(Optional.empty());
        // Act
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            studentService.getStudentId(mockUser.getUsername());
        });
        // Assert
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("getStudentId - Valid username and userId - Return student id")
    void getStudentId_ValidUsernameAndUserId_ReturnsStudentId() {
        // Arrange
        when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
        when(studentRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockStudent));
        // Act
        Long result = studentService.getStudentId(mockUser.getUsername());
        // Assert
        assertEquals(mockStudent.getId(), result);
    }

    @Test
    @DisplayName("getSchedulesByStudentId - Student not exists - Throw RuntimeException")
    void getSchedulesByStudentId_StudentNotExists_ThrowsRuntimeException() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.empty());
        // Act
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            studentService.getSchedulesByStudentId(mockStudent.getId());
        });
        // Assert
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("getSchedulesByStudentId - ClassId is empty - Return empty list")
    void getSchedulesByStudentId_ClassIdEmpty_ReturnsEmptyList() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.of(mockStudent));
        when(enrollmentRepository.findByStudentId(mockStudent.getId())).thenReturn(List.of());
        // Act
        List<ScheduleResponse> result = studentService.getSchedulesByStudentId(mockStudent.getId());
        // Assert
        assertEquals(List.of(), result);
    }

    @Test
    @DisplayName("getSchedulesByStudentId - Valid studentId and classIds - Return list of ScheduleResponse")
    void getSchedulesByStudentId_ValidStudentIdAndClassIds_ReturnsListOfScheduleResponse() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.of(mockStudent));
        mockEnrollment.setClassEntity(mockClass);
        mockEnrollment.setStatus("ACTIVE");
        when(enrollmentRepository.findByStudentId(mockStudent.getId())).thenReturn(List.of(mockEnrollment));
        mockSchedules.get(0).setClassEntity(mockClass);
        mockSchedules.get(1).setClassEntity(mockClass);
        when(scheduleRepository.findAll()).thenReturn(mockSchedules);
        when(scheduleMapper.toResponse(any())).thenReturn(ScheduleResponse.builder().build());

        // Act
        List<ScheduleResponse> result = studentService.getSchedulesByStudentId(mockStudent.getId());
        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(scheduleMapper, times(2)).toResponse(any());
    }

    @Test
    @DisplayName("getClassesByStudentId - Valid studentId - Return list of ClassResponse")
    void getClassesByStudentId_ValidStudentId_ReturnsListOfClassResponse() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.of(mockStudent));
        mockEnrollment.setClassEntity(mockClass);
        mockEnrollment.setStatus("ACTIVE");
        when(enrollmentRepository.findByStudentId(mockStudent.getId())).thenReturn(List.of(mockEnrollment));
        when(classMapper.toResponse(any())).thenReturn(ClassResponse.builder().build());

        // Act
        List<ClassResponse> result = studentService.getClassesByStudentId(mockStudent.getId());

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(classMapper, times(1)).toResponse(any());
    }

    @Test
    @DisplayName("getAllStudents - Return list of StudentResponse")
    void getAllStudents_ReturnsListOfStudentResponse() {
        // Arrange
        when(studentRepository.findAll()).thenReturn(List.of(mockStudent));
        when(studentMapper.toResponse(any())).thenReturn(StudentResponse.builder().build());

        // Act
        List<StudentResponse> result = studentService.getAllStudents();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(studentMapper, times(1)).toResponse(any());
    }

    @Test
    @DisplayName("getAllStudents - StudentId not exists - Throw ResourceNotFoundException")
    void getStudentById_StudentIdNotExists_ThrowsResourceNotFoundException() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.empty());
        // Act
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            studentService.getStudentById(mockStudent.getId());
        });
        // Assert
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("getAllStudents - Valid studentId - Return StudentResponse")
    void getStudentById_ValidStudentId_ReturnsStudentResponse() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.of(mockStudent));
        when(studentMapper.toResponse(any())).thenReturn(StudentResponse.builder().build());

        // Act
        StudentResponse result = studentService.getStudentById(mockStudent.getId());

        // Assert
        assertNotNull(result);
        verify(studentMapper, times(1)).toResponse(any());
    }

    @Test
    @DisplayName("updateStudent - StudentId not exists - Throw ResourceNotFoundException")
    void updateStudent_StudentIdNotExists_ThrowsResourceNotFoundException() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.empty());
        // Act
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            studentService.updateStudent(mockStudent.getId(), null);
        });
        // Assert
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("updateStudent - Valid studentId and StudentRequest - Return StudentResponse")
    void updateStudent_ValidStudentIdAndStudentRequest_ReturnsStudentResponse() {
        // Arrange
        when(studentRepository.findById(mockStudent.getId())).thenReturn(Optional.of(mockStudent));
        when(studentMapper.toResponse(any())).thenReturn(StudentResponse.builder().build());

        // Act
        StudentResponse result = studentService.updateStudent(mockStudent.getId(), null);

        // Assert
        assertNotNull(result);
        verify(studentMapper, times(1)).updateEntityFromRequest(any(), any());
        verify(studentRepository, times(1)).save(any());
        verify(studentMapper, times(1)).toResponse(any());
    }
}
