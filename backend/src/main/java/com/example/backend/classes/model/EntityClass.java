package com.example.backend.classes.model;

import java.time.LocalDateTime;

import com.example.backend.courses.model.Course;
import com.example.backend.teachers.model.Teacher;

import jakarta.persistence.Column;
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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "classes")
public class EntityClass {
  // class id, class name, course id, teacher id, max students, enrolled students,
  // start date, end date
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(unique = true, nullable = false)
  private String className;
  private Integer maxStudents;
  private Integer enrolledStudents;
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  // registration window for this class (when students can register)
  private LocalDateTime registrationStart;
  private LocalDateTime registrationEnd;

  // relationship with course, many to one relationship with course
  @ManyToOne
  @JoinColumn(name = "course_id")
  private Course course;

  // teacher id, many to one relationship with teacher
  @ManyToOne
  @JoinColumn(name = "teacher_id")
  private Teacher teacher;
}