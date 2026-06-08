package com.example.backend.teachers.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TeacherResponse {
    private Long teacherId;
    private Long userId;
    private String specialization;
    private String userName;
    private UserInfo user;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String fullname;
        private String username;
    }
}
