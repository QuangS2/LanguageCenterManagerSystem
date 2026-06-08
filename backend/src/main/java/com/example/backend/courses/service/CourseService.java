package com.example.backend.courses.service;

import java.util.List;

import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.courses.dto.request.CourseRequest;
import com.example.backend.courses.dto.response.CourseResponse;

import jakarta.validation.Valid;

public interface CourseService {

    List<CourseResponse> getAllCourses(String keyword, boolean visibleOnly);

    List<ClassResponse> getClassesByCourseId(Long courseId, boolean visibleOnly);

    // Backwards-compatible defaults: return all records unless the caller opts into
    // visible-only filtering.
    default List<CourseResponse> getAllCourses(String keyword) {
        return getAllCourses(keyword, false);
    }

    default List<ClassResponse> getClassesByCourseId(Long courseId) {
        return getClassesByCourseId(courseId, false);
    }

    CourseResponse createCourse(CourseRequest courseCreateRequest);

    CourseResponse updateCourse(Long courseId, CourseRequest courseRequest);

    void deleteCourse(Long courseId);

}
