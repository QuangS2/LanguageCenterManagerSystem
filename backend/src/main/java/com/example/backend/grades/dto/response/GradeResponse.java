package com.example.backend.grades.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GradeResponse {
    private Long gradeId;
    private Long studentId;
    private Long classId;
    private BigDecimal midtermGrade;
    private BigDecimal finalGrade;
    private String comment;
    private String result;
}
