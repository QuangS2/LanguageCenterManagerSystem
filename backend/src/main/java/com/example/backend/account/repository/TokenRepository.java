package com.example.backend.account.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.account.model.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {
    void deleteByToken(String token);
    void deleteByRefreshToken(String refreshToken);
    Optional<Token> findByToken(String token);
    Optional<Token> findByRefreshToken(String refreshToken);
}
