package com.example.backend.enrollments.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class EnrollResponse {

    private Long id;
    private String enrollmentDate;
    private String status;
    private Long studentId; //student response
    private Long classId; //class response
}
