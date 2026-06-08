package com.example.backend.account.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class RoleRequest {
    @NotBlank(message = "Role name must not be blank")
    @Size(min = 2, max = 25, message = "Name must be between 2 and 25 characters")
    private String name;
}
