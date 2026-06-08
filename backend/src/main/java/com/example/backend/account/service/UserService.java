package com.example.backend.account.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.request.UserUpdateRequest;
import com.example.backend.account.dto.response.MeProfileResponse;
import com.example.backend.account.dto.response.UserResponse;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.schedules.dto.response.ScheduleResponse;

public interface UserService {
    Page<UserResponse> getUsers(String name, Pageable pageable);

    Optional<UserResponse> getUserById(Long id);

    Optional<UserResponse> getUserByUsername(String username);

    // getcurrent user
    Optional<UserResponse> getCurrentUser(Authentication authentication);

    MeProfileResponse getMyProfile(Authentication authentication);

    Set<String> getRoleNames(Optional<UserResponse> user);

    String resolveProfileType(Set<String> roles);

    List<ClassResponse> getMyClasses(Long userId, Set<String> roles);

    List<GradeResponse> getMyGrades(Long userId, Set<String> roles);

    List<PaymentResponse> getMyPayments(Long userId, Set<String> roles);

    List<ScheduleResponse> getMySchedules(Long userId, Set<String> roles);

    // create
    UserResponse create(UserRegisterRequest request);

    // update
    UserResponse update(Long id, UserUpdateRequest request);

    // delete user by id
    void delete(Long id);

    // assign role to user
    Optional<UserResponse> assignRoleToUser(Long userId, String roleName);

    // remove role from user
    Optional<UserResponse> removeRoleFromUser(Long userId, String roleName);

    UserResponse updateUser(Long userId, UserUpdateRequest request);

    UserResponse deactivateUser(Long userId);
}
