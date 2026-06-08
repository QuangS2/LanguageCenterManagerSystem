package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.courses.dto.request.CourseRequest;
import com.example.backend.courses.dto.response.CourseResponse;
import com.example.backend.courses.mapper.CourseMapper;
import com.example.backend.courses.model.Course;
import com.example.backend.courses.repository.CourseRepository;
import com.example.backend.courses.service.impl.CourseServiceImpl;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;
import com.example.backend.teachers.model.Teacher;
import com.example.backend.account.model.User;

@ExtendWith(MockitoExtension.class)
public class CourseServiceImplTest {
    @InjectMocks
    private CourseServiceImpl courseService;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private ClassRepository classRepository;
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private CourseMapper courseMapper;
    @Mock
    private ClassMapper classMapper;

    @Test
    @DisplayName("Create course - success - save and map response")
    void createCourse_success_saveAndMapResponse() {
        CourseRequest request = new CourseRequest();
        request.setName("new course");
        Course course = new Course();
        course.setId(1L);
        when(courseMapper.toEntity(request)).thenReturn(course);
        when(courseRepository.save(course)).thenReturn(course);
        when(courseMapper.toResponse(course)).thenReturn(CourseResponse.builder().name("new course").build());

        CourseResponse response = courseService.createCourse(request);

        assertEquals(request.getName(), response.getName());
        verify(courseMapper).toEntity(request);
        verify(courseRepository).save(course);
        verify(courseMapper).toResponse(course);
    }

    @Test
    @DisplayName("Update course - not found - throw ResourceNotFoundException")
    void updateCourse_notFound_throwResourceNotFoundException() {

        when(courseRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> courseService.updateCourse(1L, new CourseRequest()));
    }

    @Test
    @DisplayName("Update course - success - call mapper and save")
    void updateCourse_success_callMapperAndSave() {
        CourseRequest request = new CourseRequest();
        request.setName("updated course");
        Course existingCourse = new Course();
        existingCourse.setId(1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existingCourse));

        when(courseRepository.save(existingCourse)).thenReturn(existingCourse);
        when(courseMapper.toResponse(existingCourse))
                .thenReturn(CourseResponse.builder().name("updated course").build());

        CourseResponse response = courseService.updateCourse(1L, request);

        assertEquals(request.getName(), response.getName());
        verify(courseMapper).updateEntityFromRequest(request, existingCourse);
        verify(courseRepository).save(existingCourse);
        verify(courseMapper).toResponse(existingCourse);
    }

    @Test
    @DisplayName("Get all courses - empty keyword - use findAll")
    void getAllCourses_emptyKeyword_useFindAll() {
        Course course = new Course();
        course.setId(1L);
        course.setName("English");

        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(classRepository.findByCourseId(1L)).thenReturn(List.of());

        List<CourseResponse> result = courseService.getAllCourses("");

        assertEquals(1, result.size());
        assertEquals("English", result.get(0).getName());
    }

    @Test
    @DisplayName("Get all courses - with keyword - use search repository")
    void getAllCourses_withKeyword_useSearch() {
        Course course = new Course();
        course.setId(2L);
        course.setName("Toeic");

        when(courseRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase("toeic", "toeic"))
                .thenReturn(List.of(course));
        when(classRepository.findByCourseId(2L)).thenReturn(List.of());

        List<CourseResponse> result = courseService.getAllCourses("toeic");

        assertEquals(1, result.size());
        assertEquals("Toeic", result.get(0).getName());
    }

    @Test
    @DisplayName("Get classes by course id - map response list")
    void getClassesByCourseId_mapResponseList() {
        EntityClass classEntity = new EntityClass();
        classEntity.setId(10L);

        when(classRepository.findByCourseId(1L)).thenReturn(List.of(classEntity));
        when(classMapper.toResponse(classEntity)).thenReturn(com.example.backend.classes.dto.response.ClassResponse
                .builder().classId(10L).build());

        var result = courseService.getClassesByCourseId(1L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getClassId());
    }

    @Test
    @DisplayName("Delete course - not found - throw ResourceNotFoundException")
    void deleteCourse_notFound_throwResourceNotFoundException() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> courseService.deleteCourse(1L));
    }

    @Test
    @DisplayName("Delete course - has classes - throw IllegalArgumentException")
    void deleteCourse_hasClasses_throwIllegalArgumentException() {
        Course course = new Course();
        course.setId(1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(classRepository.findByCourseId(1L)).thenReturn(List.of(new EntityClass()));

        assertThrows(IllegalArgumentException.class, () -> courseService.deleteCourse(1L));
    }

    @Test
    @DisplayName("Delete course - no classes - delete course")
    void deleteCourse_noClasses_deleteCourse() {
        Course course = new Course();
        course.setId(1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(classRepository.findByCourseId(1L)).thenReturn(List.of());

        courseService.deleteCourse(1L);

        verify(courseRepository).delete(course);
    }

    @Test
    @DisplayName("Get all courses - map preview class and schedule")
    void getAllCourses_mapPreviewClassAndSchedule() {
        Course course = new Course();
        course.setId(1L);
        course.setName("General English");
        course.setTuitionFee(new BigDecimal("1000000"));

        User teacherUser = new User();
        teacherUser.setFullname("Teacher A");
        Teacher teacher = new Teacher();
        teacher.setUser(teacherUser);

        EntityClass classEntity = new EntityClass();
        classEntity.setId(10L);
        classEntity.setClassName("GE-01");
        classEntity.setTeacher(teacher);
        classEntity.setStartDate(LocalDateTime.of(2024, 1, 1, 8, 0));
        classEntity.setEndDate(LocalDateTime.of(2024, 1, 1, 10, 0));

        Schedule schedule = new Schedule();
        schedule.setLessonDate(LocalDate.of(2024, 1, 2));
        schedule.setStartTime(LocalTime.of(9, 0));
        schedule.setEndTime(LocalTime.of(11, 0));
        schedule.setRoomNumber("A1");

        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(classRepository.findByCourseId(1L)).thenReturn(List.of(classEntity));
        when(scheduleRepository.findByClassEntityId(10L)).thenReturn(List.of(schedule));

        List<CourseResponse> result = courseService.getAllCourses("");

        assertEquals(1, result.size());
        CourseResponse response = result.get(0);
        assertNotNull(response.getDefaultLessonDate());
        assertEquals("Teacher A", response.getTeacherName());
        assertEquals("GE-01", response.getDefaultClassName());
        assertEquals("A1", response.getDefaultRoomNumber());
    }
}
