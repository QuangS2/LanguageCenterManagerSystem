package com.example.backend.discounts.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DiscountResponse {
    private Long id;
    private String name;
    private Integer discountPercent;
    private String description;
    private Boolean active;
}
