package com.example.backend.enrollments.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.enrollments.dto.request.EnrollRequest;
import com.example.backend.enrollments.dto.response.EnrollResponse;
import com.example.backend.enrollments.model.Enrollment;
import com.example.backend.enrollments.mapper.EnrollmentMapper;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.enrollments.service.EnrollmentService;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    // Repository
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    // mapper
    private final EnrollmentMapper enrollmentMapper;

    @Override
    public EnrollResponse enroll(EnrollRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        EntityClass classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (enrollmentRepository.existsByClassEntityIdAndStudentId(classEntity.getId(), student.getId())) {
            throw new IllegalArgumentException("Enrollment already exists for this student and class");
        }

        Integer maxStudents = classEntity.getMaxStudents();
        Integer enrolledStudents = classEntity.getEnrolledStudents();
        if (maxStudents != null && enrolledStudents != null && enrolledStudents >= maxStudents) {
            throw new IllegalArgumentException("Class is already full");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setClassEntity(classEntity);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus("PENDING_PAYMENT");
        enrollment.setPayment(null);

        classEntity.setEnrolledStudents((enrolledStudents == null ? 0 : enrolledStudents) + 1);
        classRepository.save(classEntity);

        return enrollmentMapper.toResponse(enrollmentRepository.save(enrollment));
    }

    @Override
    public List<EnrollResponse> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(enrollmentMapper::toResponse)
                .toList();
    }

    @Override
    public EnrollResponse updateEnrollment(Long enrollmentId, EnrollRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        EntityClass classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (enrollmentRepository.existsByClassEntityIdAndStudentIdAndIdNot(classEntity.getId(), student.getId(),
                enrollmentId)) {
            throw new IllegalArgumentException("Enrollment already exists for this student and class");
        }

        enrollment.setStudent(student);
        enrollment.setClassEntity(classEntity);
        return enrollmentMapper.toResponse(enrollmentRepository.save(enrollment));
    }
}
