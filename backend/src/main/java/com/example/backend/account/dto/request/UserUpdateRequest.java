package com.example.backend.account.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters")
    private String fullname;
    @Min(value = 0, message = "Age must be a positive number")
    @Max(value = 120, message = "Age must be less than 120")
    private Integer age;
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format")
    private String email;
}
