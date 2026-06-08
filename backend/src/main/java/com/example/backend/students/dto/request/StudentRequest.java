package com.example.backend.students.dto.request;

import lombok.Data;

@Data
public class StudentRequest {
    private String dateOfBirth;
    private String phone;
    private String address;
}
