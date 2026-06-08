package com.example.backend.students.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.payments.service.PaymentService;
import com.example.backend.students.dto.request.StudentRequest;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.mapper.StudentMapper;
import com.example.backend.students.service.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final PaymentService paymentService;
    private final StudentService studentService;
    private final StudentMapper studentMapper;

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','STUDENT')")
    @GetMapping("/{studentId}/payments")
    public List<PaymentResponse> getAllPaymentsByStudentId(@PathVariable Long studentId,
            Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN") && !hasAuthority(authentication, "STAFF")
                && hasAuthority(authentication, "STUDENT")) {
            Long currentStudentId = studentService.getStudentId(authentication.getName());
            if (!currentStudentId.equals(studentId)) {
                throw new AccessDeniedException("You are not allowed to access other students' payments");
            }
        }
        return paymentService.getAllPaymentsByStudentId(studentId);
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream().anyMatch(granted -> granted.getAuthority().equals(authority));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        List<StudentResponse> response = studentService.getAllStudents();
        return ResponseEntity.ok(response);
    }

    // get student by id
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','STUDENT')")
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id, Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN") && !hasAuthority(authentication, "STAFF")
                && hasAuthority(authentication, "STUDENT")) {
            Long currentStudentId = studentService.getStudentId(authentication.getName());
            if (!currentStudentId.equals(id)) {
                throw new AccessDeniedException("You are not allowed to access other students' information");
            }
        }
        StudentResponse response = studentService.getStudentById(id);
        return ResponseEntity.ok(response);
    }

    // update student by id
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id,
            @RequestBody StudentRequest studentRequest) {
        StudentResponse response = studentService.updateStudent(id, studentRequest);
        return ResponseEntity.ok(response);
    }

}
