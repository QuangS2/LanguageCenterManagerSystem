package com.example.backend.enrollments.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.enrollments.dto.request.EnrollRequest;
import com.example.backend.enrollments.dto.response.EnrollResponse;
import com.example.backend.enrollments.model.Enrollment;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    Enrollment toEntity(EnrollRequest request);

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "classId", source = "classEntity.id")
    @Mapping(target = "enrollmentDate", source = "enrollmentDate", dateFormat = "yyyy-MM-dd")
    EnrollResponse toResponse(Enrollment enrollment);
}
