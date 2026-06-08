package com.example.backend.account.service;

import com.example.backend.account.dto.request.LoginRequest;
import com.example.backend.account.dto.request.LogoutRequest;
import com.example.backend.account.dto.request.UserRegisterRequest;
import com.example.backend.account.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    void register(UserRegisterRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(LogoutRequest request);

    boolean isValidRefreshToken(String refreshToken);

}
