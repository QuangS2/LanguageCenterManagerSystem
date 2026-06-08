package com.example.backend.courses.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.mapper.ClassMapper;
import com.example.backend.classes.model.EntityClass;
import com.example.backend.classes.repository.ClassRepository;
import com.example.backend.courses.dto.response.CourseResponse.CourseResponseBuilder;
import com.example.backend.courses.dto.request.CourseRequest;
import com.example.backend.courses.dto.response.CourseResponse;
import com.example.backend.courses.mapper.CourseMapper;
import com.example.backend.courses.model.Course;
import com.example.backend.courses.repository.CourseRepository;
import com.example.backend.courses.service.CourseService;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.schedules.model.Schedule;
import com.example.backend.schedules.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

        // repository
        private final CourseRepository courseRepository;
        private final ClassRepository classRepository;
        private final ScheduleRepository scheduleRepository;
        // mapper
        private final CourseMapper courseMapper;
        private final ClassMapper classMapper;

        @Override
        public List<CourseResponse> getAllCourses(String keyword, boolean visibleOnly) {
                List<String> normalizedKeywords = normalizeKeyword(keyword);
                List<Course> courses = (normalizedKeywords.isEmpty()
                                ? courseRepository.findAll()
                                : courseRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                                                normalizedKeywords.get(0), normalizedKeywords.get(1)));

                if (!visibleOnly) {
                        return courses.stream().map(this::toCourseResponse).collect(Collectors.toList());
                }

                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                return courses.stream()
                                .filter(c -> courseHasOpenClass(c.getId(), now))
                                .map(this::toCourseResponse)
                                .collect(Collectors.toList());
        }

        private List<String> normalizeKeyword(String keyword) {
                if (!StringUtils.hasText(keyword)) {
                        return List.of();
                }

                String normalizedKeyword = keyword.trim();
                return List.of(normalizedKeyword, normalizedKeyword);
        }

        @Override
        public List<ClassResponse> getClassesByCourseId(Long courseId, boolean visibleOnly) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                List<EntityClass> classes = visibleOnly
                                ? classRepository
                                                .findByCourseIdAndRegistrationStartLessThanEqualAndRegistrationEndGreaterThanEqual(
                                                                courseId,
                                                                now, now)
                                : classRepository.findByCourseId(courseId);

                return classes.stream().map(classMapper::toResponse).collect(Collectors.toList());
        }

        private boolean courseHasOpenClass(Long courseId, java.time.LocalDateTime now) {
                var open = classRepository
                                .findByCourseIdAndRegistrationStartLessThanEqualAndRegistrationEndGreaterThanEqual(
                                                courseId,
                                                now, now);
                return open != null && !open.isEmpty();
        }

        @Override
        public CourseResponse createCourse(CourseRequest courseCreateRequest) {
                // Map request to entity
                var courseEntity = courseMapper.toEntity(courseCreateRequest);

                // Save entity
                var savedCourse = courseRepository.save(courseEntity);

                // Map saved entity to response
                return courseMapper.toResponse(savedCourse);
        }

        @Override
        public CourseResponse updateCourse(Long courseId, CourseRequest courseRequest) {
                // Find existing course
                var existingCourse = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

                // Update fields
                courseMapper.updateEntityFromRequest(courseRequest, existingCourse);

                // Save updated course
                var updatedCourse = courseRepository.save(existingCourse);

                // Map to response
                return courseMapper.toResponse(updatedCourse);
        }

        @Override
        public void deleteCourse(Long courseId) {
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

                if (!classRepository.findByCourseId(courseId).isEmpty()) {
                        throw new IllegalArgumentException("Không thể xóa khóa học đã được gán vào lớp học.");
                }

                courseRepository.delete(course);
        }

        private CourseResponse toCourseResponse(Course course) {
                List<EntityClass> courseClasses = classRepository.findByCourseId(course.getId());
                EntityClass previewClass = courseClasses.stream()
                                .sorted(Comparator.comparing(EntityClass::getStartDate,
                                                Comparator.nullsLast(Comparator.naturalOrder())))
                                .findFirst()
                                .orElse(null);

                Schedule previewSchedule = null;
                if (previewClass != null) {
                        previewSchedule = scheduleRepository.findByClassEntityId(previewClass.getId()).stream()
                                        .sorted(Comparator
                                                        .comparing(Schedule::getLessonDate,
                                                                        Comparator.nullsLast(Comparator.naturalOrder()))
                                                        .thenComparing(Schedule::getStartTime,
                                                                        Comparator.nullsLast(
                                                                                        Comparator.naturalOrder())))
                                        .findFirst()
                                        .orElse(null);
                }

                LocalDate previewLessonDate = previewSchedule != null ? previewSchedule.getLessonDate() : null;
                LocalTime previewStartTime = previewSchedule != null
                                ? previewSchedule.getStartTime()
                                : (previewClass != null && previewClass.getStartDate() != null
                                                ? previewClass.getStartDate().toLocalTime()
                                                : null);
                LocalTime previewEndTime = previewSchedule != null
                                ? previewSchedule.getEndTime()
                                : (previewClass != null && previewClass.getEndDate() != null
                                                ? previewClass.getEndDate().toLocalTime()
                                                : null);
                String previewRoomNumber = previewSchedule != null ? previewSchedule.getRoomNumber() : null;

                CourseResponseBuilder builder = CourseResponse.builder()
                                .id(course.getId())
                                .name(course.getName())
                                .imageUrl(course.getImageUrl())
                                .description(course.getDescription())
                                .duration(course.getDuration())
                                .tuitionFee(course.getTuitionFee() != null ? course.getTuitionFee().toPlainString()
                                                : null)
                                .durationWeeks(course.getDurationWeeks())
                                .level(course.getLevel())
                                .teacherName(previewClass != null && previewClass.getTeacher() != null
                                                && previewClass.getTeacher().getUser() != null
                                                                ? previewClass.getTeacher().getUser().getFullname()
                                                                : null)
                                .defaultClassName(previewClass != null ? previewClass.getClassName() : null)
                                .defaultLessonDate(previewLessonDate != null ? previewLessonDate.toString() : null)
                                .defaultStartTime(previewStartTime != null ? previewStartTime.toString() : null)
                                .defaultEndTime(previewEndTime != null ? previewEndTime.toString() : null)
                                .defaultRoomNumber(previewRoomNumber);

                return builder.build();
        }

}
