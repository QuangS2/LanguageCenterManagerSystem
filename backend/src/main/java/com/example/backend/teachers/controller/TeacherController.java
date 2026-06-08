package com.example.backend.teachers.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.teachers.dto.request.TeacherRequest;
import com.example.backend.teachers.dto.response.TeacherResponse;
import com.example.backend.teachers.service.TeacherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<TeacherResponse> createTeacher(@Valid @RequestBody TeacherRequest request) {
        TeacherResponse response = teacherService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(@PathVariable Long id,
            @Valid @RequestBody TeacherRequest request) {
        TeacherResponse response = teacherService.updateTeacher(id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable Long id) {
        TeacherResponse response = teacherService.getTeacherById(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STAFF')")
    @GetMapping
    public ResponseEntity<List<TeacherResponse>> getAllTeachers() {
        List<TeacherResponse> response = teacherService.getAllTeachers();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }

    // get classes by teacher id
    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STAFF')")
    @GetMapping("/{teacherId}/classes")
    public ResponseEntity<List<ClassResponse>> getClassesByTeacherId(@PathVariable Long teacherId,
            Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN")
                && hasAuthority(authentication, "TEACHER")
                && !teacherService.isTeacherOfClass(authentication.getName(), teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<ClassResponse> response = teacherService.getClassesByTeacherId(teacherId);
        return ResponseEntity.ok(response);
    }

    private boolean hasAuthority(Authentication authentication, String string) {
        return authentication.getAuthorities().stream().anyMatch(granted -> granted.getAuthority().equals(string));
    }
}