package com.example.backend.grades.service;

import com.example.backend.grades.dto.request.GradeRequest;
import com.example.backend.grades.dto.response.GradeResponse;
import java.util.List;

public interface GradeService {
    GradeResponse inputGrade(GradeRequest request);
    GradeResponse updateGrade(Long id, GradeRequest request);
    GradeResponse getGradeById(Long id);
    List<GradeResponse> getGradesByStudentId(Long studentId);
    List<GradeResponse> getGradesByClassId(Long classId);
    void deleteGrade(Long id);
}
