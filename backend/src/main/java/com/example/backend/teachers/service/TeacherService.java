package com.example.backend.teachers.service;

import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.teachers.dto.request.TeacherRequest;
import com.example.backend.teachers.dto.response.TeacherResponse;
import java.util.List;

public interface TeacherService {
    TeacherResponse createTeacher(TeacherRequest request);

    TeacherResponse updateTeacher(Long id, TeacherRequest request);

    TeacherResponse getTeacherById(Long id);

    List<TeacherResponse> getAllTeachers();

    void deleteTeacher(Long id);

    Long getTeacherId(String username);

    List<ScheduleResponse> getSchedulesByTeacherId(Long teacherId);

    List<ClassResponse> getClassesByTeacherId(Long teacherId);

    boolean isTeacherOfClass(String name, Long teacherId);
}
