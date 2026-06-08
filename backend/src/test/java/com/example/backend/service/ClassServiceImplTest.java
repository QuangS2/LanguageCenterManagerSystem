package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.account.dto.response.UserResponse;
import com.example.backend.account.service.UserService;
import com.example.backend.classes.dto.request.ClassRequest;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.classes.service.impl.ClassServiceImpl;
import com.example.backend.courses.model.Course;
import com.example.backend.courses.repository.CourseRepository;
import com.example.backend.enrollments.model.Enrollment;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.teachers.repository.TeacherRepository;

@ExtendWith(MockitoExtension.class)
public class ClassServiceImplTest {
    @InjectMocks
    private ClassServiceImpl classService;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private ClassMapper classMapper;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private UserService userService;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private StudentMapper studentMapper;

    @Test
    @DisplayName("Create class - course not found - throw ResourceNotFoundException")
    void createClass_courseNotFound_throwResourceNotFoundException() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(1L);
        request.setTeacherId(1L);

        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> classService.createClass(request));
        verify(classRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create class - teacher not found - throw ResourceNotFoundException")
    void createClass_teacherNotFound_throwResourceNotFoundException() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(1L);
        request.setTeacherId(1L);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(new Course()));
        when(teacherRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> classService.createClass(request));
        verify(classRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create class - start date after end date - throw IllegalArgumentException")
    void createClass_startDateAfterEndDate_throwIllegalArgumentException() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(1L);
        request.setTeacherId(1L);
        request.setStartDate(LocalDateTime.of(2024, 12, 31, 0, 0));
        request.setEndDate(LocalDateTime.of(2024, 1, 1, 0, 0));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(new Course()));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(new Teacher()));

        assertThrows(IllegalArgumentException.class, () -> classService.createClass(request));
        verify(classRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create class - valid request - return ClassResponse")
    void createClass_success_setEnrolledStudentsZero() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(1L);
        request.setTeacherId(2L);

        Course mockCourse = new Course();
        mockCourse.setId(1L);
        Teacher mockTeacher = new Teacher();
        mockTeacher.setId(2L);

        EntityClass entity = new EntityClass();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(teacherRepository.findById(2L)).thenReturn(Optional.of(mockTeacher));
        when(classMapper.toEntity(request)).thenReturn(entity);
        when(classRepository.save(entity)).thenReturn(entity);
        when(classMapper.toResponse(entity)).thenReturn(ClassResponse.builder().classId(1L).build());

        ClassResponse response = classService.createClass(request);

        assertNotNull(response);
        assertEquals(1L, response.getClassId());
        verify(classMapper).toEntity(request);
        verify(classRepository).save(entity);
        verify(classMapper).toResponse(entity);
    }

    @Test
    @DisplayName("Update class - class not found - throw ResourceNotFoundException")
    void updateClass_notFound_throwResourceNotFoundException() {
        when(classRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> classService.updateClass(1L, new com.example.backend.classes.dto.request.ClassRequest()));
        verify(classRepository, never()).save(any());
    }

    @Test
    @DisplayName("Is student of class - enrollment exists - return true")
    void isStudentOfClass_returnTrueWhenEnrollmentExists() {
        String username = "studentUser";
        Long userId = 10L;
        Long studentId = 11L;

        UserResponse user = new UserResponse(userId, "name", 0, "email", username, true, java.util.Set.of());

        Student student = new Student();
        student.setId(studentId);

        when(userService.getUserByUsername(username)).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(userId)).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByClassEntityIdAndStudentId(1L, studentId)).thenReturn(true);

        assertTrue(classService.isStudentOfClass(username, 1L));
        verify(enrollmentRepository).existsByClassEntityIdAndStudentId(1L, studentId);
    }

    @Test
    @DisplayName("Is student of class - enrollment does not exist - return false")
    void isStudentOfClass_returnFalseWhenEnrollmentNotExists() {
        String username = "studentUser";
        Long userId = 10L;
        Long studentId = 11L;

        UserResponse user = new UserResponse(userId, "name", 0, "email", username, true, java.util.Set.of());

        Student student = new Student();
        student.setId(studentId);

        when(userService.getUserByUsername(username)).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(userId)).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByClassEntityIdAndStudentId(1L, studentId)).thenReturn(false);

        assertFalse(classService.isStudentOfClass(username, 1L));
        verify(enrollmentRepository).existsByClassEntityIdAndStudentId(1L, studentId);
    }

    @Test
    @DisplayName("Get students in class - map student response correctly")
    void getStudentsInClass_mapStudentResponseCorrectly() {
        Student student = new Student();
        student.setId(5L);

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);

        when(enrollmentRepository.findByClassEntityId(1L)).thenReturn(List.of(enrollment));
        when(studentMapper.toResponse(student)).thenReturn(StudentResponse.builder().id(5L).build());

        var result = classService.getStudentsInClass(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getId());
        verify(studentMapper).toResponse(student);
    }

    @Test
    @DisplayName("Get students in class - no enrollments - return empty list")
    void getStudentsInClass_returnEmptyListWhenNoEnrollments() {
        when(enrollmentRepository.findByClassEntityId(1L)).thenReturn(List.of());

        var result = classService.getStudentsInClass(1L);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("Get class by id - not found - throw ResourceNotFoundException")
    void getClassById_notFound_throwResourceNotFoundException() {
        when(classRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> classService.getClassById(1L));
        verify(classMapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Update class - valid request - update fields")
    void updateClass_validRequest_updateFields() {
        ClassRequest request = new ClassRequest();
        request.setClassName("Updated class");
        request.setMaxStudents(20);
        request.setStartDate(LocalDateTime.of(2024, 1, 2, 9, 0));
        request.setEndDate(LocalDateTime.of(2024, 1, 2, 11, 0));

        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);

        when(classRepository.findById(1L)).thenReturn(Optional.of(classEntity));
        when(classRepository.save(classEntity)).thenReturn(classEntity);
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(1L).build());

        ClassResponse response = classService.updateClass(1L, request);

        assertNotNull(response);
        assertEquals("Updated class", classEntity.getClassName());
        assertEquals(20, classEntity.getMaxStudents());
        verify(classRepository).save(classEntity);
        verify(classMapper).toResponse(classEntity);
    }

    @Test
    @DisplayName("Update class - change course and teacher - reload related entities")
    void updateClass_changeCourseAndTeacher_reloadRelatedEntities() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(10L);
        request.setTeacherId(20L);
        request.setClassName("Updated class");
        request.setMaxStudents(25);
        request.setStartDate(LocalDateTime.of(2024, 1, 2, 9, 0));
        request.setEndDate(LocalDateTime.of(2024, 1, 2, 11, 0));
        request.setRegistrationStart(LocalDateTime.of(2024, 1, 1, 9, 0));
        request.setRegistrationEnd(LocalDateTime.of(2024, 1, 1, 18, 0));

        Course existingCourse = new Course();
        existingCourse.setId(1L);
        Teacher existingTeacher = new Teacher();
        existingTeacher.setId(2L);

        Course newCourse = new Course();
        newCourse.setId(10L);
        Teacher newTeacher = new Teacher();
        newTeacher.setId(20L);

        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);
        classEntity.setCourse(existingCourse);
        classEntity.setTeacher(existingTeacher);

        when(classRepository.findById(1L)).thenReturn(Optional.of(classEntity));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(newCourse));
        when(teacherRepository.findById(20L)).thenReturn(Optional.of(newTeacher));
        when(classRepository.save(classEntity)).thenReturn(classEntity);
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(1L).build());

        ClassResponse response = classService.updateClass(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getClassId());
        verify(courseRepository).findById(10L);
        verify(teacherRepository).findById(20L);
        verify(classRepository).save(classEntity);
        verify(classMapper).toResponse(classEntity);
    }

    @Test
    @DisplayName("Update class - same course and teacher ids - skip reload")
    void updateClass_sameCourseAndTeacherIds_skipReload() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(10L);
        request.setTeacherId(20L);
        request.setClassName("Updated class");
        request.setMaxStudents(25);

        Course existingCourse = new Course();
        existingCourse.setId(10L);
        Teacher existingTeacher = new Teacher();
        existingTeacher.setId(20L);

        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);
        classEntity.setCourse(existingCourse);
        classEntity.setTeacher(existingTeacher);

        when(classRepository.findById(1L)).thenReturn(Optional.of(classEntity));
        when(classRepository.save(classEntity)).thenReturn(classEntity);
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(1L).build());

        ClassResponse response = classService.updateClass(1L, request);

        assertNotNull(response);
        verify(courseRepository, never()).findById(anyLong());
        verify(teacherRepository, never()).findById(anyLong());
        verify(classRepository).save(classEntity);
    }

    @Test
    @DisplayName("Update class - registration window invalid - throw IllegalArgumentException")
    void updateClass_registrationWindowInvalid_throwIllegalArgumentException() {
        ClassRequest request = new ClassRequest();
        request.setClassName("Updated class");
        request.setRegistrationStart(LocalDateTime.of(2024, 1, 2, 9, 0));
        request.setRegistrationEnd(LocalDateTime.of(2024, 1, 1, 9, 0));

        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);

        when(classRepository.findById(1L)).thenReturn(Optional.of(classEntity));

        assertThrows(IllegalArgumentException.class, () -> classService.updateClass(1L, request));
        verify(classRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create class - registration window invalid - throw IllegalArgumentException")
    void createClass_registrationWindowInvalid_throwIllegalArgumentException() {
        ClassRequest request = new ClassRequest();
        request.setCourseId(1L);
        request.setTeacherId(2L);
        request.setStartDate(LocalDateTime.of(2024, 1, 2, 9, 0));
        request.setEndDate(LocalDateTime.of(2024, 1, 2, 11, 0));
        request.setRegistrationStart(LocalDateTime.of(2024, 1, 2, 10, 0));
        request.setRegistrationEnd(LocalDateTime.of(2024, 1, 2, 8, 0));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(new Course()));
        when(teacherRepository.findById(2L)).thenReturn(Optional.of(new Teacher()));

        assertThrows(IllegalArgumentException.class, () -> classService.createClass(request));
        verify(classRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get class by id - valid id - return response")
    void getClassById_validId_returnResponse() {
        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);
        when(classRepository.findById(1L)).thenReturn(Optional.of(classEntity));
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(1L).build());

        ClassResponse response = classService.getClassById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getClassId());
        verify(classMapper).toResponse(classEntity);
    }

    @Test
    @DisplayName("Get all classes - return list")
    void getAllClasses_returnList() {
        EntityClass classOne = new EntityClass();
        classOne.setId(1L);
        EntityClass classTwo = new EntityClass();
        classTwo.setId(2L);

        when(classRepository.findAll()).thenReturn(List.of(classOne, classTwo));
        when(classMapper.toResponse(classOne)).thenReturn(ClassResponse.builder().classId(1L).build());
        when(classMapper.toResponse(classTwo)).thenReturn(ClassResponse.builder().classId(2L).build());

        List<ClassResponse> result = classService.getAllClasses();

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Get classes by course id - return list")
    void getClassesByCourseId_returnList() {
        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);

        when(classRepository.findByCourseId(1L)).thenReturn(List.of(classEntity));
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(1L).build());

        List<ClassResponse> result = classService.getClassesByCourseId(1L);

        assertEquals(1, result.size());
        verify(classMapper).toResponse(classEntity);
    }

    @Test
    @DisplayName("Delete class - not found - throw ResourceNotFoundException")
    void deleteClass_notFound_throwResourceNotFoundException() {
        when(classRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> classService.deleteClass(1L));
        verify(classRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Delete class - valid id - deleteById")
    void deleteClass_validId_deleteById() {
        when(classRepository.existsById(1L)).thenReturn(true);

        classService.deleteClass(1L);

        verify(classRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Get classes by teacher id - return list")
    void getClassesByTeacherId_returnList() {
        EntityClass classEntity = new EntityClass();
        classEntity.setId(1L);

        when(classRepository.findByTeacherId(2L)).thenReturn(List.of(classEntity));
        when(classMapper.toResponse(classEntity)).thenReturn(ClassResponse.builder().classId(1L).build());

        List<ClassResponse> result = classService.getClassesByTeacherId(2L);

        assertEquals(1, result.size());
        verify(classMapper).toResponse(classEntity);
    }

    @Test
    @DisplayName("Is teacher of class - repository returns true")
    void isTeacherOfClass_returnTrue() {
        when(classRepository.existsByIdAndTeacherUserUsername(1L, "teacherUser")).thenReturn(true);

        assertTrue(classService.isTeacherOfClass("teacherUser", 1L));
    }

    @Test
    @DisplayName("Is student of class - user not found - throw ResourceNotFoundException")
    void isStudentOfClass_userNotFound_throwResourceNotFoundException() {
        when(userService.getUserByUsername("missingUser")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> classService.isStudentOfClass("missingUser", 1L));
    }

    @Test
    @DisplayName("Is student of class - student not found - throw ResourceNotFoundException")
    void isStudentOfClass_studentNotFound_throwResourceNotFoundException() {
        UserResponse user = new UserResponse(10L, "name", 0, "email", "studentUser", true, java.util.Set.of());
        when(userService.getUserByUsername("studentUser")).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> classService.isStudentOfClass("studentUser", 1L));
    }
}
