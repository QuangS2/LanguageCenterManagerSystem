package com.example.backend.attendance.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.attendance.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByScheduleId(Long scheduleId);

    Optional<Attendance> findByIdAndStudentUserUsername(Long id, String username);

    Optional<Attendance> findByIdAndScheduleClassEntityTeacherUserUsername(Long id, String username);

    List<Attendance> findByScheduleIdAndScheduleClassEntityTeacherUserUsername(Long scheduleId, String username);
}
