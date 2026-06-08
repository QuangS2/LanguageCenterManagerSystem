package com.example.backend.grades.model;

import java.math.BigDecimal;

import com.example.backend.classes.model.EntityClass;
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
@Table(name = "grades", uniqueConstraints = @UniqueConstraint(columnNames = { "studentId", "classId" }))
public class Grades {
    // grade id, student id, class id, midterm grade, final grade, comment, result
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal midtermGrade;
    private BigDecimal finalGrade;
    private String comment;
    private String result;

    // student id, many to one relationship with student
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
    // class id, many to one relationship with class
    @ManyToOne
    @JoinColumn(name = "class_id")
    private EntityClass classEntity;
}
