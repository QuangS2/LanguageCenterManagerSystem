package com.example.backend.enrollments.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.enrollments.model.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
	List<Enrollment> findByStudentId(Long studentId);

	boolean existsByClassEntityIdAndStudentId(Long classId, Long studentId);

	boolean existsByClassEntityIdAndStudentIdAndIdNot(Long classId, Long studentId, Long id);

	List<Enrollment> findByClassEntityId(Long id);
}
