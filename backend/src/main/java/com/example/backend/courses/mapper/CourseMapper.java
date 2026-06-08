package com.example.backend.courses.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.example.backend.courses.dto.request.CourseRequest;
import com.example.backend.courses.dto.response.CourseResponse;
import com.example.backend.courses.model.Course;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    CourseResponse toResponse(Course course);

    Course toEntity(CourseRequest courseRequest);

    // update
    void updateEntityFromRequest(CourseRequest courseRequest, @MappingTarget Course course);
}
