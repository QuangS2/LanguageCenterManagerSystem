package com.example.backend.discounts.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.discounts.model.Discount;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
    List<Discount> findByActiveTrue();
}
