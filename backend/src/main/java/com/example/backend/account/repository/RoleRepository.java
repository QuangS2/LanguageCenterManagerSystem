package com.example.backend.account.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.account.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // You can add custom query methods here if needed  
    Optional<Role> findByNameIgnoreCase(String name);
}
