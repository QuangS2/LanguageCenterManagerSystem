package com.example.backend.classes.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

import com.example.backend.classes.dto.request.ClassRequest;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.service.ClassService;
import com.example.backend.students.dto.response.StudentResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {
    private final ClassService classService;

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody ClassRequest request) {
        ClassResponse response = classService.createClass(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<ClassResponse> updateClass(@PathVariable Long id, @Valid @RequestBody ClassRequest request) {
        ClassResponse response = classService.updateClass(id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT','STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable Long id) {
        ClassResponse response = classService.getClassById(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT','STAFF')")
    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        List<ClassResponse> response = classService.getAllClasses();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT','STAFF')")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ClassResponse>> getClassesByCourseId(@PathVariable Long courseId) {
        List<ClassResponse> response = classService.getClassesByCourseId(courseId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

    // get students in class
    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT','STAFF')")
    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentResponse>> getStudentsInClass(@PathVariable Long id,
            Authentication authentication)
            throws AccessDeniedException {
        // if teacher, only access their own class
        if (!hasAuthority(authentication, "ADMIN")
                && !hasAuthority(authentication, "STAFF")
                && hasAuthority(authentication, "TEACHER")
                && !classService.isTeacherOfClass(authentication.getName(), id)) {
            throw new AccessDeniedException("You are not allowed to access students of this class");
        }
        if (!hasAuthority(authentication, "ADMIN")
                && !hasAuthority(authentication, "STAFF")
                && hasAuthority(authentication, "STUDENT")
                && !classService.isStudentOfClass(authentication.getName(), id)) {
            throw new AccessDeniedException("You are not allowed to access students of this class");
        }
        List<StudentResponse> response = classService.getStudentsInClass(id);
        return ResponseEntity.ok(response);

    }

    private boolean hasAuthority(Authentication authentication, String string) {
        return authentication.getAuthorities().stream().anyMatch(granted -> granted.getAuthority().equals(string));
    }
}
