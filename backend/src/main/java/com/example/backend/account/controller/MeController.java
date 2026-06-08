package com.example.backend.account.controller;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.account.dto.response.MeProfileResponse;
import com.example.backend.account.dto.response.UserResponse;

import com.example.backend.account.service.UserService;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.schedules.dto.response.ScheduleResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<MeProfileResponse> getMyProfile(Authentication authentication) {
        MeProfileResponse response = userService.getMyProfile(authentication);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getAllPaymentsByStudentId(Authentication authentication) {
        Optional<UserResponse> currentUser = userService.getCurrentUser(authentication);
        Long userId = currentUser.orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Set<String> roles = userService.getRoleNames(currentUser);
        List<PaymentResponse> response = userService.getMyPayments(userId, roles);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('TEACHER','STUDENT')")
    @GetMapping("/schedules")
    public ResponseEntity<List<ScheduleResponse>> getTeachingSchedules(Authentication authentication) {
        Optional<UserResponse> currentUser = userService.getCurrentUser(authentication);
        Long userId = currentUser.orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Set<String> roles = userService.getRoleNames(currentUser);
        List<ScheduleResponse> response = userService.getMySchedules(userId, roles);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('TEACHER','STUDENT')")
    @GetMapping("/classes")
    public ResponseEntity<List<ClassResponse>> getMyClasses(Authentication authentication) {
        Optional<UserResponse> currentUser = userService.getCurrentUser(authentication);
        Long userId = currentUser.orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Set<String> roles = userService.getRoleNames(currentUser);

        List<ClassResponse> response = userService.getMyClasses(userId, roles);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/grades")
    public ResponseEntity<List<GradeResponse>> getMyGrades(Authentication authentication) {
        Optional<UserResponse> currentUser = userService.getCurrentUser(authentication);
        Long userId = currentUser.orElseThrow(() -> new IllegalArgumentException("User not found")).getId();
        Set<String> roles = userService.getRoleNames(currentUser);

        List<GradeResponse> response = userService.getMyGrades(userId, roles);

        return ResponseEntity.ok(response);
    }

}
