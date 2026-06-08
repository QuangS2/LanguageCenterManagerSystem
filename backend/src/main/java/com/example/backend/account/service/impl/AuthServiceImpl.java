package com.example.backend.account.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.account.dto.request.LoginRequest;
import com.example.backend.account.dto.request.LogoutRequest;
import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.response.AuthResponse;
import com.example.backend.account.model.Token;
import com.example.backend.account.model.User;
import com.example.backend.account.repository.TokenRepository;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.account.service.AuthService;
import com.example.backend.account.service.UserService;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.TokenNotValidException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    // role repository,user mapper, password encoder, user repository,
    // Authentication manager, jwt service, token repository, user service

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final UserService userService;

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (isValidRefreshToken(refreshToken)) {
            String username = jwtService.extractUsername(refreshToken);

            String newAccessToken = jwtService.generateToken(username);
            String newRefreshToken = jwtService.generateRefreshToken(username);

            tokenRepository.deleteByRefreshToken(refreshToken);
            saveTokenPair(newAccessToken, newRefreshToken);

            return new AuthResponse(newAccessToken, newRefreshToken);
        } else {
            throw new TokenNotValidException("Invalid refresh token");
        }
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        String username = jwtService.extractUsername(request.getToken());
        String refreshUsername = jwtService.extractUsername(request.getRefreshToken());

        if (!username.equals(refreshUsername)) {
            throw new TokenNotValidException("Token pair mismatch");
        }

        userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (isValidRefreshToken(request.getRefreshToken())) {
            tokenRepository.findByToken(request.getToken())
                    .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
            tokenRepository.deleteByToken(request.getToken());
            tokenRepository.deleteByRefreshToken(request.getRefreshToken());
        } else {
            throw new TokenNotValidException("Invalid refresh token");
        }
    }

    @Override
    @Transactional
    public void register(UserRegisterRequest request) {
        userService.create(request);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!user.isActive()) {
            throw new TokenNotValidException("User account is inactive");
        }

        String accessToken = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());
        saveTokenPair(accessToken, refreshToken);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Override
    public boolean isValidRefreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!user.isActive()) {
            return false;
        }
        return tokenRepository.findByRefreshToken(refreshToken).isPresent()
                && jwtService.isTokenValid(refreshToken, user.getUsername());
    }

    private void saveTokenPair(String accessToken, String refreshToken) {
        Token tokenEntity = new Token();
        tokenEntity.setToken(accessToken);
        tokenEntity.setRefreshToken(refreshToken);
        tokenRepository.save(tokenEntity);
    }

}
