package com.example.backend.account.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.request.UserUpdateRequest;
import com.example.backend.account.dto.response.MeProfileResponse;
import com.example.backend.account.dto.response.UserResponse;
import com.example.backend.account.mapper.UserMapper;
import com.example.backend.account.model.Role;
import com.example.backend.account.model.User;
import com.example.backend.account.service.UserService;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.TokenNotValidException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.grades.mapper.GradeMapper;
import com.example.backend.grades.repository.GradeRepository;
import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.payments.mapper.PaymentMapper;
import com.example.backend.payments.repository.PaymentRepository;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;
import com.example.backend.students.service.StudentService;
import com.example.backend.teachers.mapper.TeacherMapper;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.teachers.repository.TeacherRepository;
import com.example.backend.account.repository.RoleRepository;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.teachers.service.TeacherService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    // userRepository
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final GradeRepository gradeRepository;
    private final GradeMapper gradeMapper;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final TeacherService teacherService;
    private final TeacherMapper teacherMapper;
    private final StudentService studentService;
    private final StudentMapper studentMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Optional<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new TokenNotValidException("Unauthenticated user");
        }

        return userRepository.findByUsername(authentication.getName()).map(userMapper::toResponse);
    }

    @Override
    public Optional<UserResponse> assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Role role = roleRepository.findByNameIgnoreCase(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().add(role);
        return Optional.of(userMapper.toResponse(userRepository.save(user)));
    }

    @Override
    public Optional<UserResponse> removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Role role = roleRepository.findByNameIgnoreCase(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().remove(role);
        return Optional.of(userMapper.toResponse(userRepository.save(user)));
    }

    @Override
    public MeProfileResponse getMyProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new TokenNotValidException("Unauthenticated user");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        Student student = studentRepository.findByUserId(user.getId()).orElse(null);
        Teacher teacher = teacherRepository.findByUserId(user.getId()).orElse(null);
        String profileType = resolveProfileType(roles);

        MeProfileResponse response = MeProfileResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullname())
                .age(user.getAge())
                .email(user.getEmail())
                .username(user.getUsername())
                .active(user.isActive())
                .roles(roles)
                .profileType(profileType)
                .studentInfo(student != null ? studentMapper.toResponse(student) : null)
                .teacherInfo(teacher != null ? teacherMapper.toResponse(teacher) : null)
                .build();

        return response;
    }

    @Override
    public Set<String> getRoleNames(Optional<UserResponse> user) {
        return user.map(UserResponse::getRoles)
                .orElse(Set.of())
                .stream()
                .collect(Collectors.toSet());
    }

    @Override
    public String resolveProfileType(Set<String> roles) {
        if (roles.contains("TEACHER")) {
            return "TEACHER";
        }
        if (roles.contains("STUDENT")) {
            return "STUDENT";
        }
        if (roles.contains("ADMIN")) {
            return "ADMIN";
        }
        return "UNKNOWN";
    }

    @Override
    public List<ClassResponse> getMyClasses(Long userId, Set<String> roles) {
        List<ClassResponse> response;
        if (roles.contains("TEACHER")) {
            Long teacherId = teacherRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"))
                    .getId();
            response = teacherService.getClassesByTeacherId(teacherId);
        } else if (roles.contains("STUDENT")) {
            Long studentId = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"))
                    .getId();
            response = studentService.getClassesByStudentId(studentId);

        } else {
            response = List.of(); // Admin and unknown roles get an empty list of classes
        }
        return response;
    }

    @Override
    public List<GradeResponse> getMyGrades(Long userId, Set<String> roles) {
        List<GradeResponse> response;
        if (roles.contains("STUDENT")) {
            Long studentId = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"))
                    .getId();
            response = gradeRepository.findByStudentId(studentId).stream()
                    .map(gradeMapper::toResponse)
                    .toList();

            // Only student can see their grades, teacher and admin can see by class, so we
            // return null for teacher and admin
        } else {

            response = List.of();

        }
        return response;
    }

    @Override
    public List<PaymentResponse> getMyPayments(Long userId, Set<String> roles) {
        if (!roles.contains("STUDENT")) {
            return List.of();
        }

        Long studentId = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"))
                .getId();

        return paymentRepository.findByStudentId(studentId).stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    @Override
    public List<ScheduleResponse> getMySchedules(Long userId, Set<String> roles) {
        if (roles.contains("TEACHER")) {
            Long teacherId = teacherRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"))
                    .getId();
            return teacherService.getSchedulesByTeacherId(teacherId);
        }

        if (roles.contains("STUDENT")) {
            Long studentId = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"))
                    .getId();
            return studentService.getSchedulesByStudentId(studentId);
        }

        return List.of();
    }

    @Override
    public Page<UserResponse> getUsers(String name, Pageable pageable) {
        Page<User> usersPage = userRepository.findByFullnameContainingIgnoreCase(name, pageable);
        return usersPage.map(userMapper::toResponse);
    }

    @Override
    public Optional<UserResponse> getUserById(Long id) {
        return userRepository.findById(id).map(userMapper::toResponse);
    }

    @Override
    public Optional<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse create(UserRegisterRequest request) {
        Role role = roleRepository.findByNameIgnoreCase(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }
        User user = userMapper.createToEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.getRoles().add(role);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        return userRepository.findById(id).map(user -> {
            userMapper.updateFromRequest(user, request);

            return userMapper.toResponse(userRepository.save(user));
        }).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Override
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        userMapper.updateFromRequest(user, request);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setActive(false);

        return userMapper.toResponse(userRepository.save(user));
    }
}
