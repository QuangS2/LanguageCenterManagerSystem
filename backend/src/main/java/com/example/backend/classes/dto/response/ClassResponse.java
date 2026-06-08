package com.example.backend.classes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ClassResponse {

    private Long id;
    private Long classId;
    private String className;
    private Integer maxStudents;
    private Integer enrolledStudents;
    private String startDate;
    private String endDate;
    private String registrationStart;
    private String registrationEnd;
    private String description;
    private String status;
    private CourseInfo course;
    private TeacherInfo teacher;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CourseInfo {
        private Long id;
        private String name;
        private String level;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TeacherInfo {
        private Long teacherId;
        private UserInfo user;

        @Getter
        @Builder
        @AllArgsConstructor
        public static class UserInfo {
            private Long id;
            private String fullname;
        }
    }
}
