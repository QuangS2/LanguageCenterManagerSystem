package com.example.backend.enrollments.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.enrollments.dto.request.EnrollRequest;
import com.example.backend.enrollments.dto.response.EnrollResponse;
import com.example.backend.enrollments.service.EnrollmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','STUDENT')")
    @PostMapping
    public ResponseEntity<EnrollResponse> enroll(@Valid @RequestBody EnrollRequest request) {
        EnrollResponse response = enrollmentService.enroll(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<EnrollResponse>> getAllEnrollments() {
        List<EnrollResponse> response = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<EnrollResponse> updateEnrollment(@PathVariable Long id,
            @Valid @RequestBody EnrollRequest request) {
        EnrollResponse response = enrollmentService.updateEnrollment(id, request);
        return ResponseEntity.ok(response);
    }

}
