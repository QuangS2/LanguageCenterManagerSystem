package com.example.backend.schedules.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

import com.example.backend.classes.model.EntityClass;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "schedules")
public class Schedule {
    // schedule id, class id, lesson date, start time, end time, room number
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate lessonDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomNumber;

    // class id, many to one relationship with class
    @ManyToOne
    @JoinColumn(name = "class_id")
    private EntityClass classEntity;
}
