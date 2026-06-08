package com.example.backend.classes.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.account.service.UserService;
import com.example.backend.classes.dto.request.ClassRequest;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.classes.service.ClassService;
import com.example.backend.courses.model.Course;
import com.example.backend.courses.repository.CourseRepository;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.repository.StudentRepository;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.teachers.repository.TeacherRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {
    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final ClassMapper classMapper;
    private final EnrollmentRepository enrollmentRepository;
    private final UserService userService;
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    @Override
    @Transactional
    public ClassResponse createClass(ClassRequest request) {
        // Validate course exists
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Validate teacher exists
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        // Validate dates
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getStartDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("Start date must be before end date");
            }
        }

        // Validate registration window if provided
        if (request.getRegistrationStart() != null && request.getRegistrationEnd() != null) {
            if (request.getRegistrationStart().isAfter(request.getRegistrationEnd())) {
                throw new IllegalArgumentException("Registration start must be before registration end");
            }
            if (request.getStartDate() != null && request.getRegistrationEnd().isAfter(request.getStartDate())) {
                throw new IllegalArgumentException("Registration end must be before class start date");
            }
        }

        // Create and save class
        EntityClass classEntity = classMapper.toEntity(request);
        classEntity.setCourse(course);
        classEntity.setTeacher(teacher);
        classEntity.setEnrolledStudents(0);

        return classMapper.toResponse(classRepository.save(classEntity));
    }

    @Override
    @Transactional
    public ClassResponse updateClass(Long id, ClassRequest request) {
        EntityClass classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        // Validate and update course only when the request provides one.
        if (request.getCourseId() != null && (classEntity.getCourse() == null
                || !classEntity.getCourse().getId().equals(request.getCourseId()))) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            classEntity.setCourse(course);
        }

        // Validate and update teacher only when the request provides one.
        if (request.getTeacherId() != null && (classEntity.getTeacher() == null
                || !classEntity.getTeacher().getId().equals(request.getTeacherId()))) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            classEntity.setTeacher(teacher);
        }

        // Validate dates
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getStartDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("Start date must be before end date");
            }
        }

        // Validate registration window if provided in update
        if (request.getRegistrationStart() != null && request.getRegistrationEnd() != null) {
            if (request.getRegistrationStart().isAfter(request.getRegistrationEnd())) {
                throw new IllegalArgumentException("Registration start must be before registration end");
            }
            if (request.getStartDate() != null && request.getRegistrationEnd().isAfter(request.getStartDate())) {
                throw new IllegalArgumentException("Registration end must be before class start date");
            }
        }

        // Update fields
        classEntity.setClassName(request.getClassName());
        classEntity.setMaxStudents(request.getMaxStudents());
        classEntity.setStartDate(request.getStartDate());
        classEntity.setRegistrationStart(request.getRegistrationStart());
        classEntity.setRegistrationEnd(request.getRegistrationEnd());
        classEntity.setEndDate(request.getEndDate());

        return classMapper.toResponse(classRepository.save(classEntity));
    }

    @Override
    public ClassResponse getClassById(Long id) {
        EntityClass classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        return classMapper.toResponse(classEntity);
    }

    @Override
    public List<ClassResponse> getAllClasses() {
        List<EntityClass> classes = classRepository.findAll();
        return classes.stream()
                .map(classMapper::toResponse)
                .toList();
    }

    @Override
    public List<ClassResponse> getClassesByCourseId(Long courseId) {
        List<EntityClass> classes = classRepository.findByCourseId(courseId);
        return classes.stream()
                .map(classMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteClass(Long id) {
        if (!classRepository.existsById(id)) {
            throw new ResourceNotFoundException("Class not found");
        }
        classRepository.deleteById(id);
    }

    @Override
    public List<ClassResponse> getClassesByTeacherId(Long teacherId) {
        List<EntityClass> classes = classRepository.findByTeacherId(teacherId);
        return classes.stream()
                .map(classMapper::toResponse)
                .toList();
    }

    @Override
    public boolean isTeacherOfClass(String name, Long classId) {
        return classRepository.existsByIdAndTeacherUserUsername(classId, name);
    }

    @Override
    public boolean isStudentOfClass(String name, Long id) {
        Long UserId = userService.getUserByUsername(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")).getId();
        Long studentId = studentRepository.findByUserId(UserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found")).getId();
        return enrollmentRepository.existsByClassEntityIdAndStudentId(id, studentId);
    }

    @Override
    public List<StudentResponse> getStudentsInClass(Long id) {
        return enrollmentRepository.findByClassEntityId(id)
                .stream()
                .map(enrollment -> studentMapper.toResponse(enrollment.getStudent()))
                .toList();
    }

}
