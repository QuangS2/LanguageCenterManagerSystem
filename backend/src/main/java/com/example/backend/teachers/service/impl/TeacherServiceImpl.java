package com.example.backend.teachers.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;

import com.example.backend.account.model.User;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.schedules.mapper.ScheduleMapper;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.teachers.dto.request.TeacherRequest;
import com.example.backend.teachers.dto.response.TeacherResponse;
import com.example.backend.teachers.mapper.TeacherMapper;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.teachers.repository.TeacherRepository;
import com.example.backend.teachers.service.TeacherService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {
        private final TeacherRepository teacherRepository;
        private final UserRepository userRepository;
        private final TeacherMapper teacherMapper;
        private final ScheduleMapper scheduleMapper;
        private final ScheduleRepository scheduleRepository;
        // class repository + mapper
        private final ClassRepository classRepository;
        private final ClassMapper classMapper;

        @Override
        @Transactional
        public TeacherResponse createTeacher(TeacherRequest request) {
                // Validate user exists
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Create and save teacher
                Teacher teacher = teacherMapper.toEntity(request);
                teacher.setUser(user);

                Teacher savedTeacher = teacherRepository.save(teacher);
                return toResponse(savedTeacher);
        }

        @Override
        @Transactional
        public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
                Teacher teacher = teacherRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

                // Update fields
                teacher.setSpecialization(request.getSpecialization());

                Teacher savedTeacher = teacherRepository.save(teacher);
                return toResponse(savedTeacher);
        }

        @Override
        public TeacherResponse getTeacherById(Long id) {
                Teacher teacher = teacherRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
                return toResponse(teacher);
        }

        @Override
        public List<TeacherResponse> getAllTeachers() {
                List<Teacher> teachers = teacherRepository.findAll();
                return teachers.stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Override
        @Transactional
        public void deleteTeacher(Long id) {
                if (!teacherRepository.existsById(id)) {
                        throw new ResourceNotFoundException("Teacher not found");
                }
                teacherRepository.deleteById(id);
        }

        @Override
        public Long getTeacherId(String username) {
                Long userId = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                                .getId();

                return teacherRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"))
                                .getId();
        }

        @Override
        public List<ScheduleResponse> getSchedulesByTeacherId(Long teacherId) {
                Teacher teacher = teacherRepository.findById(teacherId)
                                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
                return scheduleRepository.findByClassEntityTeacherId(teacher.getId()).stream()
                                .map(scheduleMapper::toResponse)
                                .toList();
        }

        @Override
        public List<ClassResponse> getClassesByTeacherId(Long teacherId) {
                Teacher teacher = teacherRepository.findById(teacherId)
                                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
                return classRepository.findByTeacherId(teacher.getId()).stream()
                                .map(classMapper::toResponse)
                                .toList();
        }

        @Override
        public boolean isTeacherOfClass(String name, Long teacherId) {
                return classRepository.existsByIdAndTeacherUserUsername(teacherId, name);
        }

        private TeacherResponse toResponse(Teacher teacher) {
                User user = teacher.getUser();

                return TeacherResponse.builder()
                                .teacherId(teacher.getId())
                                .userId(user != null ? user.getId() : null)
                                .specialization(teacher.getSpecialization())
                                .userName(user != null ? user.getUsername() : null)
                                .user(user != null
                                                ? TeacherResponse.UserInfo.builder()
                                                                .id(user.getId())
                                                                .fullname(user.getFullname())
                                                                .username(user.getUsername())
                                                                .build()
                                                : null)
                                .build();
        }
}
