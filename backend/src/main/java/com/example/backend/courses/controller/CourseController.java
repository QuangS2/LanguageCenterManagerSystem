package com.example.backend.courses.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.courses.dto.request.CourseRequest;
import com.example.backend.courses.dto.response.CourseResponse;
import com.example.backend.courses.service.CourseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    final CourseService courseService;

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT','STAFF')")
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses(@RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "true") boolean visible) {
        List<CourseResponse> courses = courseService.getAllCourses(keyword, visible);
        return ResponseEntity.status(HttpStatus.OK).body(courses);
    }

    // get classes by course id
    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT','STAFF')")
    @GetMapping("/{courseId}/classes")
    public ResponseEntity<List<ClassResponse>> getClassesByCourseId(@PathVariable Long courseId,
            @RequestParam(defaultValue = "true") boolean visible) {
        List<ClassResponse> classes = courseService.getClassesByCourseId(courseId, visible);
        return ResponseEntity.status(HttpStatus.OK).body(classes);
    }

    // post course
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest courseCreateRequest) {
        CourseResponse courseResponse = courseService.createCourse(courseCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseResponse);
    }

    // put course by id
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long courseId,
            @Valid @RequestBody CourseRequest courseRequest) {
        CourseResponse courseResponse = courseService.updateCourse(courseId, courseRequest);
        return ResponseEntity.status(HttpStatus.OK).body(courseResponse);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

}
