package com.example.backend.courses.model;

import java.math.BigDecimal;

import com.example.backend.account.model.User;

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
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    private String description;
    private String duration;
    private BigDecimal tuitionFee;
    private String durationWeeks;
    private String level;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}