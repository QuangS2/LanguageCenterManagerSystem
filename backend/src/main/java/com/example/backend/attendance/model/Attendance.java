package com.example.backend.attendance.model;

import com.example.backend.schedules.model.Schedule;
import com.example.backend.students.model.Student;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = {"scheduleId", "studentId"}))
public class Attendance {
    // attendance id, student id, schedule id, status (present, absent, late)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String status;

    // student id, many to one relationship with student
    @ManyToOne
    @JoinColumn(name = "studentId")
    private Student student;
    // schedule id, many to one relationship with schedule
    @ManyToOne
    @JoinColumn(name = "scheduleId")
    private Schedule schedule;
}
