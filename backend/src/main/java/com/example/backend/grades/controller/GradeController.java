package com.example.backend.grades.controller;

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

import com.example.backend.classes.service.ClassService;
import com.example.backend.grades.dto.request.GradeRequest;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.grades.service.GradeService;
import com.example.backend.students.service.StudentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {
    private final GradeService gradeService;
    private final StudentService studentService;
    private final ClassService classService;

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<GradeResponse> inputGrade(@Valid @RequestBody GradeRequest request) {
        GradeResponse response = gradeService.inputGrade(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<GradeResponse> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        GradeResponse response = gradeService.updateGrade(id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER','STUDENT')")
    @GetMapping("/{id}")
    public ResponseEntity<GradeResponse> getGradeById(@PathVariable Long id, Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN")
                && hasAuthority(authentication, "STUDENT")
                && gradeService.getGradeById(id).getStudentId() != studentService
                        .getStudentId(authentication.getName())) {
            throw new AccessDeniedException("You are not allowed to access this grade");
        }
        if (!hasAuthority(authentication, "ADMIN")
                && hasAuthority(authentication, "TEACHER")
                && !classService.isTeacherOfClass(authentication.getName(),
                        gradeService.getGradeById(id).getClassId())) {
            throw new AccessDeniedException("You are not allowed to access this grade");
        }
        GradeResponse response = gradeService.getGradeById(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STUDENT')")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeResponse>> getGradesByStudentId(@PathVariable Long studentId,
            Authentication authentication) {

        // if student, only access their own grades
        if (!hasAuthority(authentication, "ADMIN") && hasAuthority(authentication, "STUDENT")) {
            if (!studentService.getStudentId(authentication.getName()).equals(studentId)) {
                throw new AccessDeniedException("You are not allowed to access other students' grades");
            }
        }
        List<GradeResponse> response = gradeService.getGradesByStudentId(studentId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<GradeResponse>> getGradesByClassId(@PathVariable Long classId,
            Authentication authentication) {
        if (hasAuthority(authentication, "TEACHER")
                && !classService.isTeacherOfClass(authentication.getName(), classId)) {
            throw new AccessDeniedException("You are not allowed to access grades of this class");
        }
        List<GradeResponse> response = gradeService.getGradesByClassId(classId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream().anyMatch(granted -> granted.getAuthority().equals(authority));
    }
}
