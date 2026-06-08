package com.example.backend.payments.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.payments.dto.request.PaymentRequest;
import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.payments.service.PaymentService;
import com.example.backend.students.service.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    // service
    private final PaymentService paymentService;
    private final StudentService studentService;

    // post payment
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','STUDENT')")
    @PostMapping
    public ResponseEntity<PaymentResponse> payment(@RequestBody PaymentRequest request, Authentication authentication) {
        if (isStudentScoped(authentication)) {
            Long currentStudentId = studentService.getStudentId(authentication.getName());
            if (!currentStudentId.equals(request.getStudentId())) {
                throw new AccessDeniedException("You are not allowed to create payment for another student");
            }
        }
        PaymentResponse response = paymentService.payment(request, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }

    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @PostMapping("/{id}/payed")
    public ResponseEntity<PaymentResponse> payed(@PathVariable Long id, Authentication authentication) {
        PaymentResponse response = paymentService.payed(id, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream().anyMatch(granted -> granted.getAuthority().equals(authority));
    }

    private boolean isStudentScoped(Authentication authentication) {
        return hasAuthority(authentication, "STUDENT")
                && !hasAuthority(authentication, "ADMIN")
                && !hasAuthority(authentication, "STAFF");
    }

}
