package com.example.backend.grades.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.grades.dto.request.GradeRequest;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.grades.mapper.GradeMapper;
import com.example.backend.grades.model.Grades;
import com.example.backend.grades.repository.GradeRepository;
import com.example.backend.grades.service.GradeService;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GradeServiceImpl implements GradeService {
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final GradeMapper gradeMapper;

    @Override
    @Transactional
    public GradeResponse inputGrade(GradeRequest request) {
        // Validate student exists
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Validate class exists
        EntityClass classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        // Validate scores are valid (>= 0)
        validateScores(request.getMidtermGrade(), request.getFinalGrade());

        // Create and save grade
        Grades grade = gradeMapper.toEntity(request);
        grade.setStudent(student);
        grade.setClassEntity(classEntity);
        grade.setResult(calculateResult(request.getMidtermGrade(), request.getFinalGrade()));

        return gradeMapper.toResponse(gradeRepository.save(grade));
    }

    @Override
    @Transactional
    public GradeResponse updateGrade(Long id, GradeRequest request) {
        Grades grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found"));

        // Validate scores
        validateScores(request.getMidtermGrade(), request.getFinalGrade());

        // Update fields
        grade.setMidtermGrade(request.getMidtermGrade());
        grade.setFinalGrade(request.getFinalGrade());
        grade.setComment(request.getComment());
        grade.setResult(calculateResult(request.getMidtermGrade(), request.getFinalGrade()));

        return gradeMapper.toResponse(gradeRepository.save(grade));
    }

    @Override
    public GradeResponse getGradeById(Long id) {
        Grades grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found"));
        return gradeMapper.toResponse(grade);
    }

    @Override
    public List<GradeResponse> getGradesByStudentId(Long studentId) {
        List<Grades> grades = gradeRepository.findByStudentId(studentId);
        return grades.stream()
                .map(gradeMapper::toResponse)
                .toList();
    }

    @Override
    public List<GradeResponse> getGradesByClassId(Long classId) {
        List<Grades> grades = gradeRepository.findByClassEntityId(classId);
        return grades.stream()
                .map(gradeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteGrade(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grade not found");
        }
        gradeRepository.deleteById(id);
    }

    private void validateScores(BigDecimal midterm, BigDecimal finalScore) {
        validateSingleScore(midterm, "Midterm grade");
        validateSingleScore(finalScore, "Final grade");
    }

    private void validateSingleScore(BigDecimal score, String label) {
        if (score == null) {
            throw new IllegalArgumentException(label + " is required");
        }
        if (score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(BigDecimal.TEN) > 0) {
            throw new IllegalArgumentException(label + " must be between 0 and 10");
        }
    }

    private String calculateResult(BigDecimal midterm, BigDecimal finalScore) {
        // Average grade (50% midterm, 50% final)
        BigDecimal average = midterm.add(finalScore)
                .divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);

        // Result: PASS if >= 5, FAIL if < 5
        return average.compareTo(BigDecimal.valueOf(5)) >= 0 ? "PASS" : "FAIL";
    }
}
