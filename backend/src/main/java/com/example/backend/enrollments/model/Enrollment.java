package com.example.backend.enrollments.model;

import java.time.LocalDate;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.payments.model.Payment;
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
@Table(name = "enrollments", uniqueConstraints = @UniqueConstraint(columnNames = { "studentId", "classId" }))
public class Enrollment {
    // id, student id, class id, enrollment date, status
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate enrollmentDate;
    private String status;

    // student id, many to one relationship with student
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    // class id, many to one relationship with class
    @ManyToOne
    @JoinColumn(name = "class_id")
    private EntityClass classEntity;

    // payment id, many to one relationship with payment
    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;
}
