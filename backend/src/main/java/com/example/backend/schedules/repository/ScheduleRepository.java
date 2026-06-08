package com.example.backend.schedules.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.schedules.model.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByClassEntityId(Long classId);

    List<Schedule> findByClassEntityTeacherId(Long teacherId);

    boolean existsByIdAndClassEntityTeacherUserUsername(Long id, String username);
}
