package com.example.backend.account.dto.response;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private final Long id;
    private final String name;
    private final int age;
    private final String email;
    private final String username;
    private final boolean active;
    private final Set<String> roles;

}
