package com.example.backend.grades.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.grades.dto.request.GradeRequest;
import com.example.backend.grades.dto.response.GradeResponse;
import com.example.backend.grades.model.Grades;

@Mapper(componentModel = "spring")
public interface GradeMapper {
    Grades toEntity(GradeRequest request);

    @Mapping(target = "gradeId", source = "id")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "classId", source = "classEntity.id")
    GradeResponse toResponse(Grades grades);
}
