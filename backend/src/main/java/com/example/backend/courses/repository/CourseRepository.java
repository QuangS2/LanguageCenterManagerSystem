package com.example.backend.courses.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.courses.model.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String nameKeyword,
            String descriptionKeyword);

}
