package com.example.backend.students.service.impl;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.mapper.ScheduleMapper;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.students.dto.request.StudentRequest;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;
import com.example.backend.students.service.StudentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

        private final StudentRepository studentRepository;
        private final UserRepository userRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final ScheduleRepository scheduleRepository;
        private final ScheduleMapper scheduleMapper;
        // Mapper
        private final StudentMapper studentMapper;
        private final ClassMapper classMapper;

        @Override
        public Long getStudentId(String name) {
                Long userId = userRepository.findByUsername(name)
                                .orElseThrow(() -> new RuntimeException("User not found"))
                                .getId();
                return studentRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Student not found"))
                                .getId();
        }

        @Override
        @Cacheable(value = "student_schedules", key = "#studentId")
        public List<ScheduleResponse> getSchedulesByStudentId(Long studentId) {
                Student student = studentRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));
                Set<Long> classIds = enrollmentRepository.findByStudentId(student.getId()).stream()
                                .filter(enrollment -> isVisibleEnrollmentStatus(enrollment.getStatus()))
                                .map(enrollment -> enrollment.getClassEntity().getId())
                                .collect(Collectors.toSet());
                if (classIds.isEmpty()) {
                        return List.of();
                }
                return scheduleRepository.findAll().stream()
                                .filter(schedule -> classIds.contains(schedule.getClassEntity().getId()))
                                .map(scheduleMapper::toResponse)
                                .toList();
        }

        @Override
        @Cacheable(value = "student_classes", key = "#studentId")
        public List<ClassResponse> getClassesByStudentId(Long studentId) {
                studentRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));
                List<ClassResponse> response = enrollmentRepository.findByStudentId(studentId).stream()
                                .filter(enrollment -> isVisibleEnrollmentStatus(enrollment.getStatus()))
                                .map(enrollment -> enrollment.getClassEntity())
                                .collect(Collectors.toMap(
                                                classEntity -> classEntity.getId(),
                                                classMapper::toResponse,
                                                (existing, replacement) -> existing, LinkedHashMap::new))
                                .values().stream().toList();
                return response;
        }

        @Override
        @Cacheable(value = "students_all")
        public List<StudentResponse> getAllStudents() {
                return studentRepository.findAll().stream()
                                .map(studentMapper::toResponse)
                                .toList();
        }

        @Override
        @Cacheable(value = "students", key = "#id")
        public StudentResponse getStudentById(Long id) {
                Student student = studentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                return studentMapper.toResponse(student);
        }

        @Override
        @CacheEvict(value = {"students", "students_all", "student_schedules", "student_classes"}, allEntries = true)
        public StudentResponse updateStudent(Long id, StudentRequest studentRequest) {
                Student student = studentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                studentMapper.updateEntityFromRequest(studentRequest, student);
                studentRepository.save(student);
                StudentResponse response = studentMapper.toResponse(student);
                return response;

        }

        private boolean isVisibleEnrollmentStatus(String status) {
                if (status == null) {
                        return false;
                }

                String normalizedStatus = status.trim().toUpperCase();
                return normalizedStatus.equals("ACTIVE")
                                || normalizedStatus.equals("PENDING_PAYMENT")
                                || normalizedStatus.equals("PAID")
                                || normalizedStatus.equals("COMPLETED");
        }

}
