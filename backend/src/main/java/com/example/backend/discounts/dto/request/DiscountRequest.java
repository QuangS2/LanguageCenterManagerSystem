package com.example.backend.discounts.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class DiscountRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Discount percent is required")
    @Min(value = 0, message = "Discount percent must be >= 0")
    @Max(value = 100, message = "Discount percent must be <= 100")
    private Integer discountPercent;
    
    private String description;
    
    @NotNull(message = "Active status is required")
    private Boolean active;
}
