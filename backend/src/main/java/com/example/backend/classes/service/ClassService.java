package com.example.backend.classes.service;

import com.example.backend.classes.dto.request.ClassRequest;
import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.students.dto.response.StudentResponse;

import java.util.List;

public interface ClassService {
    ClassResponse createClass(ClassRequest request);

    ClassResponse updateClass(Long id, ClassRequest request);

    ClassResponse getClassById(Long id);

    List<ClassResponse> getAllClasses();

    List<ClassResponse> getClassesByCourseId(Long courseId);

    void deleteClass(Long id);

    List<ClassResponse> getClassesByTeacherId(Long teacherId);

    boolean isTeacherOfClass(String name, Long classId);

    boolean isStudentOfClass(String name, Long id);

    List<StudentResponse> getStudentsInClass(Long id);
}
