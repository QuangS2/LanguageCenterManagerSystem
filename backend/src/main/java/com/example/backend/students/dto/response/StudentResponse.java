package com.example.backend.students.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StudentResponse {
     //student id, user id (relationship with user), date of birth, phone, address
    private Long id;
    private String fullName;
    private String email;
    private String username;
    private String dateOfBirth;
    private String phone;
    private String address;
    private Long userId;
}
