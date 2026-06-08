package com.example.backend.students.service;

import java.util.Collection;
import java.util.List;

import com.example.backend.classes.dto.response.ClassResponse;
import com.example.backend.schedules.dto.response.ScheduleResponse;
import com.example.backend.students.dto.request.StudentRequest;
import com.example.backend.students.dto.response.StudentResponse;

public interface StudentService {

    Long getStudentId(String name);

    List<ScheduleResponse> getSchedulesByStudentId(Long studentId);

    // get classes by student id
    List<ClassResponse> getClassesByStudentId(Long studentId);

    List<StudentResponse> getAllStudents();

    StudentResponse getStudentById(Long id);

    StudentResponse updateStudent(Long id, StudentRequest studentRequest);

}
