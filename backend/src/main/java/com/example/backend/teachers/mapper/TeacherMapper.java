package com.example.backend.teachers.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.teachers.dto.request.TeacherRequest;
import com.example.backend.teachers.dto.response.TeacherResponse;
import com.example.backend.teachers.model.Teacher;

@Mapper(componentModel = "spring")
public interface TeacherMapper {
    Teacher toEntity(TeacherRequest request);

    @Mapping(target = "teacherId", source = "id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "user.id", source = "user.id")
    @Mapping(target = "user.fullname", source = "user.fullname")
    @Mapping(target = "user.username", source = "user.username")
    TeacherResponse toResponse(Teacher teacher);
}
