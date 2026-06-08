package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.request.UserUpdateRequest;
import com.example.backend.account.dto.response.MeProfileResponse;
import com.example.backend.account.dto.response.UserResponse;
import com.example.backend.account.mapper.UserMapper;
import com.example.backend.account.model.Role;
import com.example.backend.account.model.User;
import com.example.backend.account.repository.RoleRepository;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.account.service.impl.UserServiceImpl;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.TokenNotValidException;
import com.example.backend.grades.mapper.GradeMapper;
import com.example.backend.grades.model.Grades;
import com.example.backend.grades.repository.GradeRepository;
import com.example.backend.payments.mapper.PaymentMapper;
import com.example.backend.payments.model.Payment;
import com.example.backend.payments.repository.PaymentRepository;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;
import com.example.backend.students.service.StudentService;
import com.example.backend.teachers.mapper.TeacherMapper;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.teachers.repository.TeacherRepository;
import com.example.backend.teachers.service.TeacherService;
import com.example.backend.schedules.dto.response.ScheduleResponse;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @InjectMocks
    private UserServiceImpl userService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private GradeRepository gradeRepository;
    @Mock
    private GradeMapper gradeMapper;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentMapper paymentMapper;
    @Mock
    private TeacherService teacherService;
    @Mock
    private TeacherMapper teacherMapper;
    @Mock
    private StudentService studentService;
    @Mock
    private StudentMapper studentMapper;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private Authentication authentication;

    @Test
    @DisplayName("Get current user - null authentication - throw TokenNotValidException")
    void getCurrentUser_nullAuthentication_throwTokenNotValidException() {
        // act & assert
        assertThrows(TokenNotValidException.class, () -> userService.getCurrentUser(null));
    }

    @Test
    @DisplayName("Get current user - null username - throw TokenNotValidException")
    void getCurrentUser_nullUsername_throwTokenNotValidException() {
        // arrange
        when(authentication.getName()).thenReturn(null);

        // act & assert
        assertThrows(TokenNotValidException.class, () -> userService.getCurrentUser(authentication));
    }

    @Test
    @DisplayName("Create user - duplicate username - throw DuplicateResourceException")
    void create_duplicateUsername_throwDuplicateResourceException() {
        // arrange

        UserRegisterRequest request = new UserRegisterRequest();
        request.setUsername("existingUser");
        request.setRole("USER");
        when(roleRepository.findByNameIgnoreCase("USER")).thenReturn(Optional.of(new Role()));
        when(userRepository.existsByUsername("existingUser")).thenReturn(true);

        // act & assert
        assertThrows(DuplicateResourceException.class, () -> userService.create(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create user - valid request - encode password and set active true")
    void create_success_encodePasswordAndSetActiveTrue() {
        // arrange
        UserRegisterRequest request = new UserRegisterRequest();
        request.setUsername("newUser");
        request.setPassword("password123");
        request.setRole("USER");

        when(userRepository.existsByUsername("newUser")).thenReturn(false);
        when(roleRepository.findByNameIgnoreCase("USER")).thenReturn(Optional.of(new Role()));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userMapper.createToEntity(request)).thenReturn(new User());

        // act
        userService.create(request);

        // assert
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(argThat(user -> user.getPassword().equals("encodedPassword")
                && user.isActive() == true));

    }

    @Test
    @DisplayName("Resolve profile type - teacher - return teacher")
    void resolveProfileType_teacher_returnTeacher() {
        // arrange
        User user = new User();
        user.setUsername("teacherUser");
        Set<Role> roles;
        Role teacherRole = new Role();
        teacherRole.setName("TEACHER");
        roles = Set.of(teacherRole);
        user.setRoles(roles);
        // act
        String profileType = userService
                .resolveProfileType(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        // assert
        assertEquals("TEACHER", profileType);
    }

    @Test
    @DisplayName("Resolve profile type - student - return student")
    void resolveProfileType_student_returnStudent() {
        // arrange
        User user = new User();
        user.setUsername("studentUser");
        Set<Role> roles;
        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        roles = Set.of(studentRole);
        user.setRoles(roles);
        // act
        String profileType = userService
                .resolveProfileType(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        // assert
        assertEquals("STUDENT", profileType);
    }

    @Test
    @DisplayName("Resolve profile type - admin - return admin")
    void resolveProfileType_admin_returnAdmin() {
        // arrange
        User user = new User();
        user.setUsername("adminUser");
        Set<Role> roles;
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        roles = Set.of(adminRole);
        user.setRoles(roles);
        // act
        String profileType = userService
                .resolveProfileType(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        // assert
        assertEquals("ADMIN", profileType);
    }

    @Test
    @DisplayName("Resolve profile type - unknown - return unknown")
    void resolveProfileType_unknown_returnUnknown() {
        // arrange
        User user = new User();
        user.setUsername("unknownUser");
        Set<Role> roles;
        Role unknownRole = new Role();
        unknownRole.setName("UNKNOWN");
        roles = Set.of(unknownRole);
        user.setRoles(roles);
        // act
        String profileType = userService
                .resolveProfileType(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        // assert
        assertEquals("UNKNOWN", profileType);
    }

    @Test
    @DisplayName("Get my classes - teacher role - call teacher service")
    void getMyClasses_teacherRole_callTeacherService() {
        // arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("teacherUser");
        Set<Role> roles;
        Role teacherRole = new Role();
        teacherRole.setName("TEACHER");
        roles = Set.of(teacherRole);
        user.setRoles(roles);
        Teacher teacher = new Teacher();
        teacher.setId(1L);

        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.of(teacher));
        // act
        userService.getMyClasses(user.getId(), user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));

        // assert

        verify(teacherService).getClassesByTeacherId(1L);
    }

    @Test
    @DisplayName("Get my classes - student role - call student service")
    void getMyClasses_studentRole_callStudentService() {
        // arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("studentUser");
        Set<Role> roles;
        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        roles = Set.of(studentRole);
        user.setRoles(roles);

        Student student = new Student();
        student.setId(1L);
        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));
        // act
        userService.getMyClasses(user.getId(), user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));

        // assert

        verify(studentService).getClassesByStudentId(1L);
    }

    @Test
    @DisplayName("Get my classes - other role - return empty list")
    void getMyClasses_otherRole_returnEmptyList() {
        // arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("otherUser");
        Set<Role> roles;
        Role otherRole = new Role();
        otherRole.setName("OTHER");
        roles = Set.of(otherRole);
        user.setRoles(roles);

        // act
        var classes = userService.getMyClasses(user.getId(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));

        // assert

        assertTrue(classes.isEmpty());
    }

    @Test
    @DisplayName("Deactivate user - valid user - set active false")
    void deactivateUser_success_setActiveFalse() {
        // arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("activeUser");
        user.setActive(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // act
        userService.deactivateUser(1L);

        // assert
        verify(userRepository).save(argThat(u -> u.getId() == 1L && u.isActive() == false));
    }

    @Test
    @DisplayName("Get my profile - anonymous user - throw TokenNotValidException")
    void getMyProfile_anonymousUser_throwTokenNotValidException() {
        when(authentication.getName()).thenReturn("anonymousUser");

        assertThrows(TokenNotValidException.class, () -> userService.getMyProfile(authentication));
    }

    @Test
    @DisplayName("Get my profile - student - return profile with student info")
    void getMyProfile_student_returnProfile() {
        when(authentication.getName()).thenReturn("studentUser");

        Role studentRole = new Role();
        studentRole.setName("STUDENT");

        User user = new User();
        user.setId(1L);
        user.setUsername("studentUser");
        user.setFullname("Student A");
        user.setAge(20);
        user.setEmail("student@example.com");
        user.setActive(true);
        user.setRoles(Set.of(studentRole));

        Student student = new Student();
        student.setId(10L);

        when(userRepository.findByUsername("studentUser")).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));
        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(studentMapper.toResponse(student)).thenReturn(StudentResponse.builder().id(10L).build());

        MeProfileResponse response = userService.getMyProfile(authentication);

        assertNotNull(response);
        assertEquals("STUDENT", response.getProfileType());
        assertEquals(10L, response.getStudentInfo().getId());
    }

    @Test
    @DisplayName("Assign role to user - valid request - return response")
    void assignRoleToUser_validRequest_returnResponse() {
        Role role = new Role();
        role.setName("ADMIN");

        User user = new User();
        user.setId(1L);
        user.setRoles(new HashSet<>());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roleRepository.findByNameIgnoreCase("ADMIN")).thenReturn(Optional.of(role));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "name", 0, "email", "user", true,
                Set.of("ADMIN")));

        var response = userService.assignRoleToUser(1L, "ADMIN");

        assertTrue(response.isPresent());
        assertTrue(user.getRoles().contains(role));
    }

    @Test
    @DisplayName("Remove role from user - valid request - return response")
    void removeRoleFromUser_validRequest_returnResponse() {
        Role role = new Role();
        role.setName("ADMIN");

        User user = new User();
        user.setId(1L);
        user.setRoles(new HashSet<>(Set.of(role)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roleRepository.findByNameIgnoreCase("ADMIN")).thenReturn(Optional.of(role));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "name", 0, "email", "user", true,
                Set.of()));

        var response = userService.removeRoleFromUser(1L, "ADMIN");

        assertTrue(response.isPresent());
        assertFalse(user.getRoles().contains(role));
    }

    @Test
    @DisplayName("Get my grades - student role - return list")
    void getMyGrades_studentRole_returnList() {
        Student student = new Student();
        student.setId(2L);

        Grades grade = new Grades();
        grade.setId(1L);

        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));
        when(gradeRepository.findByStudentId(2L)).thenReturn(List.of(grade));
        when(gradeMapper.toResponse(grade)).thenReturn(com.example.backend.grades.dto.response.GradeResponse.builder()
                .gradeId(1L).build());

        var result = userService.getMyGrades(1L, Set.of("STUDENT"));

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get my grades - non student role - return empty list")
    void getMyGrades_nonStudentRole_returnEmptyList() {
        var result = userService.getMyGrades(1L, Set.of("TEACHER"));

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Get my payments - student role - return list")
    void getMyPayments_studentRole_returnList() {
        Student student = new Student();
        student.setId(3L);

        Payment payment = new Payment();
        payment.setId(1L);

        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));
        when(paymentRepository.findByStudentId(3L)).thenReturn(List.of(payment));
        when(paymentMapper.toResponse(payment)).thenReturn(com.example.backend.payments.dto.response.PaymentResponse
                .builder().id(1L).build());

        var result = userService.getMyPayments(1L, Set.of("STUDENT"));

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get my payments - non student role - return empty list")
    void getMyPayments_nonStudentRole_returnEmptyList() {
        var result = userService.getMyPayments(1L, Set.of("TEACHER"));

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Get my schedules - teacher role - return list")
    void getMySchedules_teacherRole_returnList() {
        Teacher teacher = new Teacher();
        teacher.setId(4L);

        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.of(teacher));
        when(teacherService.getSchedulesByTeacherId(4L))
                .thenReturn(List.of(ScheduleResponse.builder().scheduleId(1L).build()));

        var result = userService.getMySchedules(1L, Set.of("TEACHER"));

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get my schedules - student role - return list")
    void getMySchedules_studentRole_returnList() {
        Student student = new Student();
        student.setId(5L);

        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));
        when(studentService.getSchedulesByStudentId(5L))
                .thenReturn(List.of(ScheduleResponse.builder().scheduleId(2L).build()));

        var result = userService.getMySchedules(1L, Set.of("STUDENT"));

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get my schedules - other role - return empty list")
    void getMySchedules_otherRole_returnEmptyList() {
        var result = userService.getMySchedules(1L, Set.of("ADMIN"));

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Get users - return page of responses")
    void getUsers_returnPageOfResponses() {
        User user = new User();
        user.setId(1L);

        when(userRepository.findByFullnameContainingIgnoreCase("a", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(user)));
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "A", 0, "a@example.com", "user", true,
                Set.of()));

        var result = userService.getUsers("a", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("Get user by id - return optional response")
    void getUserById_returnOptionalResponse() {
        User user = new User();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "A", 0, "a@example.com", "user", true,
                Set.of()));

        var result = userService.getUserById(1L);

        assertTrue(result.isPresent());
    }

    @Test
    @DisplayName("Get user by username - return optional response")
    void getUserByUsername_returnOptionalResponse() {
        User user = new User();
        user.setId(1L);

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "A", 0, "a@example.com", "user", true,
                Set.of()));

        var result = userService.getUserByUsername("user");

        assertTrue(result.isPresent());
    }

    @Test
    @DisplayName("Delete user - not found - throw UserNotFoundException")
    void delete_userNotFound_throwUserNotFoundException() {
        when(userRepository.existsById(1L)).thenReturn(false);

        assertThrows(UserNotFoundException.class, () -> userService.delete(1L));
    }

    @Test
    @DisplayName("Delete user - valid user - delete by id")
    void delete_validUser_deleteById() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.delete(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Update user - not found - throw UserNotFoundException")
    void update_userNotFound_throwUserNotFoundException() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.update(1L, new UserUpdateRequest()));
    }

    @Test
    @DisplayName("Update user - valid request - save and map response")
    void update_validRequest_saveAndMapResponse() {
        User user = new User();
        user.setId(1L);

        UserUpdateRequest request = new UserUpdateRequest();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "A", 0, "a@example.com", "user", true,
                Set.of()));

        var response = userService.update(1L, request);

        assertEquals(1L, response.getId());
        verify(userMapper).updateFromRequest(user, request);
    }

    @Test
    @DisplayName("Update user by id - valid request - save and map response")
    void updateUser_validRequest_saveAndMapResponse() {
        User user = new User();
        user.setId(1L);

        UserUpdateRequest request = new UserUpdateRequest();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new com.example.backend.account.dto.response.UserResponse(1L,
                "A", 0, "a@example.com", "user", true,
                Set.of()));

        var response = userService.updateUser(1L, request);

        assertEquals(1L, response.getId());
        verify(userMapper).updateFromRequest(user, request);
    }
}
