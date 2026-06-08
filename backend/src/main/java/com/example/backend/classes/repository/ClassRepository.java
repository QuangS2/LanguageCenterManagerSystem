package com.example.backend.classes.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.classes.model.EntityClass;

public interface ClassRepository extends JpaRepository<EntityClass, Long> {

    List<EntityClass> findByCourseId(Long courseId);

    List<EntityClass> findByTeacherId(Long teacherId);

    boolean existsByIdAndTeacherUserUsername(Long id, String username);

    // find classes for a course where registration window covers the given moment
    List<EntityClass> findByCourseIdAndRegistrationStartLessThanEqualAndRegistrationEndGreaterThanEqual(Long courseId,
            LocalDateTime beforeOrEqual, LocalDateTime afterOrEqual);

}
