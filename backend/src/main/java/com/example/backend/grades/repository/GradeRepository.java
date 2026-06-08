package com.example.backend.grades.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.grades.model.Grades;

@Repository
public interface GradeRepository extends JpaRepository<Grades, Long> {
    List<Grades> findByStudentId(Long studentId);

    List<Grades> findByClassEntityId(Long classId);

    Optional<Grades> findByIdAndStudentUserUsername(Long id, String username);

    Optional<Grades> findByIdAndClassEntityTeacherUserUsername(Long id, String username);

    List<Grades> findByClassEntityIdAndClassEntityTeacherUserUsername(Long classId, String username);

}
