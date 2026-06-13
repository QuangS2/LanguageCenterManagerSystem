package com.example.backend.courses.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    
    private Long id;
    private String name;
    private String imageUrl;
    private String description;
    private String duration;
    private String tuitionFee;
    private String durationWeeks;
    private String level;
    private String teacherName;
    private String defaultClassName;
    private String defaultLessonDate;
    private String defaultStartTime;
    private String defaultEndTime;
    private String defaultRoomNumber;

}
