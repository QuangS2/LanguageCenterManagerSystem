package com.example.backend.classes.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.classes.dto.request.ClassRequest;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.classes.model.EntityClass;

@Mapper(componentModel = "spring")
public interface ClassMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "classId", source = "id")
    @Mapping(target = "startDate", expression = "java(formatDateTime(entityClass.getStartDate()))")
    @Mapping(target = "endDate", expression = "java(formatDateTime(entityClass.getEndDate()))")
    @Mapping(target = "registrationStart", expression = "java(formatDateTime(entityClass.getRegistrationStart()))")
    @Mapping(target = "registrationEnd", expression = "java(formatDateTime(entityClass.getRegistrationEnd()))")
    @Mapping(target = "course.id", source = "course.id")
    @Mapping(target = "course.name", source = "course.name")
    @Mapping(target = "course.level", source = "course.level")
    @Mapping(target = "teacher.teacherId", source = "teacher.id")
    @Mapping(target = "teacher.user.id", source = "teacher.user.id")
    @Mapping(target = "teacher.user.fullname", source = "teacher.user.fullname")
    @Mapping(target = "description", source = "course.description")
    @Mapping(target = "status", expression = "java(resolveStatus(entityClass))")
    ClassResponse toResponse(EntityClass entityClass);

    EntityClass toEntity(ClassRequest classRequest);

    default String formatDateTime(java.time.LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toString() : null;
    }

    default String resolveStatus(EntityClass entityClass) {
        if (entityClass == null || entityClass.getEndDate() == null) {
            return "ACTIVE";
        }

        return entityClass.getEndDate().isBefore(java.time.LocalDateTime.now()) ? "COMPLETED" : "ACTIVE";
    }
}
