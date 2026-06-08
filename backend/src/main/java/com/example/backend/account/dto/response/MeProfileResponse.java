package com.example.backend.account.dto.response;

import java.util.Set;

import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.teachers.dto.response.TeacherResponse;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MeProfileResponse {
    private final Long userId;
    private final String fullName;
    private final Integer age;
    private final String email;
    private final String username;
    private final boolean active;
    private final Set<String> roles;
    private final String profileType;
    private final StudentResponse studentInfo;
    private final TeacherResponse teacherInfo;
}