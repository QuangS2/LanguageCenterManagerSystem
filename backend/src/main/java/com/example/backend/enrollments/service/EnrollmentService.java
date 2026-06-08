package com.example.backend.enrollments.service;

import java.util.List;

import com.example.backend.enrollments.dto.request.EnrollRequest;
import com.example.backend.enrollments.dto.response.EnrollResponse;

public interface EnrollmentService {
    EnrollResponse enroll(EnrollRequest request);

    List<EnrollResponse> getAllEnrollments();

    EnrollResponse updateEnrollment(Long enrollmentId, EnrollRequest request);

}
