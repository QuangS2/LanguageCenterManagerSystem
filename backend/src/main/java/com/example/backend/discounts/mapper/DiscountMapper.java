package com.example.backend.discounts.mapper;

import org.mapstruct.Mapper;

import com.example.backend.discounts.dto.request.DiscountRequest;
import com.example.backend.discounts.dto.response.DiscountResponse;
import com.example.backend.discounts.model.Discount;

@Mapper(componentModel = "spring")
public interface DiscountMapper {
    Discount toEntity(DiscountRequest request);
    DiscountResponse toResponse(Discount discount);
}
