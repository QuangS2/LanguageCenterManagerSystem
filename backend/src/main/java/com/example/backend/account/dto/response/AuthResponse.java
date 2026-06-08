package com.example.backend.account.dto.response;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;  

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public  class AuthResponse {
    private String accessToken;
    private String refreshToken;
}
