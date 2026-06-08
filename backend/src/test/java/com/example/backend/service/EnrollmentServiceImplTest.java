package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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

import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.enrollments.dto.request.EnrollRequest;
import com.example.backend.enrollments.dto.response.EnrollResponse;
import com.example.backend.enrollments.mapper.EnrollmentMapper;
import com.example.backend.enrollments.model.Enrollment;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.enrollments.service.impl.EnrollmentServiceImpl;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
public class EnrollmentServiceImplTest {
    @InjectMocks
    private EnrollmentServiceImpl enrollmentService;

    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private EnrollmentMapper enrollmentMapper;

    private EnrollRequest request;
    private Student mockStudent;
    private EntityClass mockClass;

    @BeforeEach
    void setUp() {
        request = new EnrollRequest();
        request.setStudentId(1L);
        request.setClassId(1L);

        mockStudent = new Student();
        mockStudent.setId(1L);

        mockClass = new EntityClass();
        mockClass.setId(1L);

    }

    @Test
    @DisplayName("Enroll - Student not found - Throws ResourceNotFoundException")
    void enroll_studentNotFound_throwsResourceNotFoundException() {
        // Arrange
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.empty());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.enroll(request);
        });
        // Assert
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("Enroll - Class not found - Throws ResourceNotFoundException")
    void enroll_classNotFound_throwsResourceNotFoundException() {
        // Arrange
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.of(mockStudent));
        when(classRepository.findById(request.getClassId())).thenReturn(Optional.empty());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.enroll(request);
        });
        // Assert
        assertEquals("Class not found", exception.getMessage());
    }

    @Test
    @DisplayName("Enroll - Enrollment already exists - Throws IllegalArgumentException")
    void enroll_enrollmentAlreadyExists_throwsIllegalArgumentException() {
        // Arrange
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.of(mockStudent));
        when(classRepository.findById(request.getClassId())).thenReturn(Optional.of(mockClass));
        when(enrollmentRepository.existsByClassEntityIdAndStudentId(mockClass.getId(), mockStudent.getId()))
                .thenReturn(true);
        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            enrollmentService.enroll(request);
        });
        // Assert
        assertEquals("Enrollment already exists for this student and class", exception.getMessage());
    }

    @Test
    @DisplayName("Enroll - Valid request - Returns EnrollResponse")
    void enroll_validRequest_returnsEnrollResponse() {
        // Arrange
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.of(mockStudent));
        when(classRepository.findById(request.getClassId())).thenReturn(Optional.of(mockClass));
        when(enrollmentRepository.existsByClassEntityIdAndStudentId(mockClass.getId(), mockStudent.getId()))
                .thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(i -> i.getArguments()[0]);
        when(enrollmentMapper.toResponse(any(Enrollment.class))).thenReturn(EnrollResponse.builder().build());
        // Act
        EnrollResponse response = enrollmentService.enroll(request);

        // Assert
        assertNotNull(response);
    }

    @Test
    @DisplayName("getAllEnrollments - list of enrollments exists - Returns list of EnrollResponse")
    void getAllEnrollments_enrollmentsExist_returnsListOfEnrollResponse() {
        // Arrange
        Enrollment enrollment1 = new Enrollment();
        Enrollment enrollment2 = new Enrollment();
        when(enrollmentRepository.findAll()).thenReturn(List.of(enrollment1, enrollment2));
        when(enrollmentMapper.toResponse(enrollment1)).thenReturn(EnrollResponse.builder().build());
        when(enrollmentMapper.toResponse(enrollment2)).thenReturn(EnrollResponse.builder().build());

        // Act
        List<EnrollResponse> responses = enrollmentService.getAllEnrollments();

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());
    }

    @Test
    @DisplayName("updateEnrollment - Enrollment not found - Throws ResourceNotFoundException")
    void updateEnrollment_enrollmentNotFound_throwsResourceNotFoundException() {
        // Arrange
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.updateEnrollment(1L, request);
        });

        // Assert
        assertEquals("Enrollment not found", exception.getMessage());
    }

    @Test
    @DisplayName("updateEnrollment - Student not found - Throws ResourceNotFoundException")
    void updateEnrollment_studentNotFound_throwsResourceNotFoundException() {
        // Arrange
        Enrollment enrollment = new Enrollment();
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.empty());
        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.updateEnrollment(1L, request);
        });
        // Assert
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("updateEnrollment - Class not found - Throws ResourceNotFoundException")
    void updateEnrollment_classNotFound_throwsResourceNotFoundException() {
        // Arrange
        Enrollment enrollment = new Enrollment();
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.of(mockStudent));
        when(classRepository.findById(request.getClassId())).thenReturn(Optional.empty());
        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.updateEnrollment(1L, request);
        });
        // Assert
        assertEquals("Class not found", exception.getMessage());
    }

    @Test
    @DisplayName("updateEnrollment - Enrollment already exists - Throws IllegalArgumentException")
    void updateEnrollment_enrollmentAlreadyExists_throwsIllegalArgumentException() {
        // Arrange
        Enrollment enrollment = new Enrollment();
        enrollment.setId(1L);
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.of(mockStudent));
        when(classRepository.findById(request.getClassId())).thenReturn(Optional.of(mockClass));
        when(enrollmentRepository.existsByClassEntityIdAndStudentIdAndIdNot(mockClass.getId(), mockStudent.getId(),
                1L)).thenReturn(true);
        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            enrollmentService.updateEnrollment(1L, request);
        });
        // Assert
        assertEquals("Enrollment already exists for this student and class", exception.getMessage());
    }

    @Test
    @DisplayName("updateEnrollment - Valid request - Returns EnrollResponse")
    void updateEnrollment_validRequest_returnsEnrollResponse() {
        // Arrange
        Enrollment enrollment = new Enrollment();
        enrollment.setId(1L);
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.of(mockStudent));
        when(classRepository.findById(request.getClassId())).thenReturn(Optional.of(mockClass));
        when(enrollmentRepository.existsByClassEntityIdAndStudentIdAndIdNot(mockClass.getId(), mockStudent.getId(),
                1L)).thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(i -> i.getArguments()[0]);
        when(enrollmentMapper.toResponse(any(Enrollment.class))).thenReturn(EnrollResponse.builder().build());
        // Act
        EnrollResponse response = enrollmentService.updateEnrollment(1L, request);

        // Assert
        assertNotNull(response);
    }
}
