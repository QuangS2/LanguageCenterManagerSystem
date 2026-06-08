package com.example.backend.students.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.students.dto.request.StudentRequest;
import com.example.backend.students.dto.response.StudentResponse;
import com.example.backend.students.model.Student;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    @Mapping(target = "fullName", source = "user.fullname")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "username", source = "user.username")
    StudentResponse toResponse(Student student);

    void updateEntityFromRequest(StudentRequest studentRequest, @MappingTarget Student student);

}
