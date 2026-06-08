package com.example.backend.payments.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.example.backend.classes.model.EntityClass;
import com.example.backend.discounts.model.Discount;
import com.example.backend.enrollments.model.Enrollment;
import com.example.backend.students.model.Student;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Payment {
    // payment id, student id, enrollment id, amount, payment date, payment method,
    // status, discount id, class id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;
    private LocalDate date;
    private String method;
    private String status;
    private BigDecimal finalAmount;
    private LocalDate paymentDate;

    // student id, many to one relationship with student
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
    // enrollment id, one to many relationship with enrollment
    @OneToMany(mappedBy = "payment")
    private List<Enrollment> enrollments;
    // discount id, many to one relationship with discount
    @ManyToOne
    @JoinColumn(name = "discount_id")
    private Discount discount;
    // class id, many to one relationship with class
    @ManyToOne
    @JoinColumn(name = "class_id")
    private EntityClass classEntity;
}
