package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.grades.dto.request.GradeRequest;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.grades.mapper.GradeMapper;
import com.example.backend.grades.model.Grades;
import com.example.backend.grades.repository.GradeRepository;
import com.example.backend.grades.service.impl.GradeServiceImpl;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
public class GradeServiceImplTest {

    @InjectMocks
    private GradeServiceImpl gradeService;
    @Mock
    private GradeRepository gradeRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private GradeMapper gradeMapper;

    @Captor
    private ArgumentCaptor<Grades> gradeCaptor;

    private GradeRequest gradeRequest;
    private Grades grade;
    private GradeResponse gradeResponse;
    private Student student;
    private EntityClass entityClass;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);

        entityClass = new EntityClass();
        entityClass.setId(1L);

        gradeRequest = new GradeRequest();
        gradeRequest.setStudentId(1L);
        gradeRequest.setClassId(1L);
        gradeRequest.setMidtermGrade(new BigDecimal("8.0"));
        gradeRequest.setFinalGrade(new BigDecimal("8.5"));

        grade = new Grades();
        grade.setId(1L);
        grade.setStudent(student);
        grade.setClassEntity(entityClass);
        grade.setMidtermGrade(new BigDecimal("8.0"));
        grade.setFinalGrade(new BigDecimal("8.5"));
        grade.setResult("PASS");

        gradeResponse = GradeResponse.builder().gradeId(1L).result("PASS").build();
    }

    @Test
    @DisplayName("inputGrade - Valid grades with PASS result - Success")
    void inputGrade_ValidGradesWithPassResult_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(classRepository.findById(1L)).thenReturn(Optional.of(entityClass));
        when(gradeMapper.toEntity(any())).thenReturn(grade);
        when(gradeRepository.save(any())).thenReturn(grade);
        when(gradeMapper.toResponse(any())).thenReturn(gradeResponse);

        GradeResponse result = gradeService.inputGrade(gradeRequest);

        assertNotNull(result);
        verify(gradeRepository).save(gradeCaptor.capture());
        assertEquals("PASS", gradeCaptor.getValue().getResult());
    }

    @Test
    @DisplayName("inputGrade - Student not found - Throws ResourceNotFoundException")
    void inputGrade_StudentNotFound_ThrowsResourceNotFoundException() {
        when(studentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> gradeService.inputGrade(gradeRequest));
        verify(gradeRepository, never()).save(any());
    }

    @Test
    @DisplayName("inputGrade - Class not found - Throws ResourceNotFoundException")
    void inputGrade_ClassNotFound_ThrowsResourceNotFoundException() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(classRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> gradeService.inputGrade(gradeRequest));
        verify(gradeRepository, never()).save(any());
    }

    @Test
    @DisplayName("inputGrade - Negative midterm grade - Throws IllegalArgumentException")
    void inputGrade_NegativeMidtermGrade_ThrowsIllegalArgumentException() {
        gradeRequest.setMidtermGrade(new BigDecimal("-1.0"));

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(classRepository.findById(1L)).thenReturn(Optional.of(entityClass));

        assertThrows(IllegalArgumentException.class, () -> gradeService.inputGrade(gradeRequest));
        verify(gradeRepository, never()).save(any());
    }

    @Test
    @DisplayName("inputGrade - Midterm grade above 10 - Throws IllegalArgumentException")
    void inputGrade_MidtermGradeAbove10_ThrowsIllegalArgumentException() {
        gradeRequest.setMidtermGrade(new BigDecimal("10.1"));

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(classRepository.findById(1L)).thenReturn(Optional.of(entityClass));

        assertThrows(IllegalArgumentException.class, () -> gradeService.inputGrade(gradeRequest));
        verify(gradeRepository, never()).save(any());
    }

    @Test
    @DisplayName("inputGrade - Grade below 5.0 boundary - Result FAIL")
    void inputGrade_GradeBelow5Point0Boundary_ResultFAIL() {
        gradeRequest.setMidtermGrade(new BigDecimal("4.9"));
        gradeRequest.setFinalGrade(new BigDecimal("4.9"));

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(classRepository.findById(1L)).thenReturn(Optional.of(entityClass));
        when(gradeMapper.toEntity(any())).thenReturn(grade);

        gradeService.inputGrade(gradeRequest);

        verify(gradeRepository).save(gradeCaptor.capture());
        assertEquals("FAIL", gradeCaptor.getValue().getResult());
    }

    @Test
    @DisplayName("updateGrade - Valid request - Success")
    void updateGrade_ValidRequest_Success() {
        gradeRequest.setMidtermGrade(new BigDecimal("9.0")); // Giả sử điểm mới update
        when(gradeRepository.findById(1L)).thenReturn(Optional.of(grade));
        when(gradeRepository.save(any())).thenReturn(grade);
        when(gradeMapper.toResponse(any())).thenReturn(gradeResponse);

        gradeService.updateGrade(1L, gradeRequest);

        verify(gradeRepository).save(gradeCaptor.capture());
        assertEquals(new BigDecimal("9.0"), gradeCaptor.getValue().getMidtermGrade());
    }

    @Test
    @DisplayName("updateGrade - Grade not found - Throws ResourceNotFoundException")
    void updateGrade_GradeNotFound_ThrowsResourceNotFoundException() {
        when(gradeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> gradeService.updateGrade(1L, gradeRequest));
        verify(gradeRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateGrade - Update to low grades - Result FAIL")
    void updateGrade_UpdateToLowGrades_ResultFAIL() {
        gradeRequest.setMidtermGrade(new BigDecimal("2.0"));
        gradeRequest.setFinalGrade(new BigDecimal("3.0"));
        when(gradeRepository.findById(1L)).thenReturn(Optional.of(grade));

        gradeService.updateGrade(1L, gradeRequest);

        verify(gradeRepository).save(gradeCaptor.capture());
        assertEquals("FAIL", gradeCaptor.getValue().getResult());
    }

    @Test
    @DisplayName("updateGrade - Grade above 10 - Throws IllegalArgumentException")
    void updateGrade_GradeAbove10_ThrowsIllegalArgumentException() {
        gradeRequest.setFinalGrade(new BigDecimal("10.5"));
        when(gradeRepository.findById(1L)).thenReturn(Optional.of(grade));

        assertThrows(IllegalArgumentException.class, () -> gradeService.updateGrade(1L, gradeRequest));
        verify(gradeRepository, never()).save(any());
    }

    @Test
    @DisplayName("getGradeById - Valid id - Success")
    void getGradeById_ValidId_Success() {
        when(gradeRepository.findById(1L)).thenReturn(Optional.of(grade));
        when(gradeMapper.toResponse(grade)).thenReturn(gradeResponse);

        GradeResponse result = gradeService.getGradeById(1L);

        assertNotNull(result);
        verify(gradeRepository).findById(1L);
    }

    @Test
    @DisplayName("getGradesByStudentId - Multiple grades - Success")
    void getGradesByStudentId_MultipleGrades_Success() {
        when(gradeRepository.findByStudentId(1L)).thenReturn(List.of(grade, grade)); // Mock 2 items
        when(gradeMapper.toResponse(any())).thenReturn(gradeResponse);

        List<GradeResponse> result = gradeService.getGradesByStudentId(1L);

        assertEquals(2, result.size());
        verify(gradeRepository).findByStudentId(1L);
    }

    @Test
    @DisplayName("getGradesByClassId - Valid class id - Success")
    void getGradesByClassId_ValidClassId_Success() {
        when(gradeRepository.findByClassEntityId(1L)).thenReturn(List.of(grade));
        when(gradeMapper.toResponse(grade)).thenReturn(gradeResponse);

        List<GradeResponse> result = gradeService.getGradesByClassId(1L);

        assertEquals(1, result.size());
        verify(gradeRepository).findByClassEntityId(1L);
    }

    @Test
    @DisplayName("deleteGrade - Valid id - Success")
    void deleteGrade_ValidId_Success() {
        when(gradeRepository.existsById(1L)).thenReturn(true);

        gradeService.deleteGrade(1L);

        verify(gradeRepository).deleteById(1L);
    }
}
