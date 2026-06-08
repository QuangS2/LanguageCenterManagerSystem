package com.example.backend.courses.dto.request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CourseRequest {
    private String name;
    private String imageUrl;
    private String description;
    private String duration;
    private BigDecimal tuitionFee;
    private String durationWeeks;
    private String level;
}
