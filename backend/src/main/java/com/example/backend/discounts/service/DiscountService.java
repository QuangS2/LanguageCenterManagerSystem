package com.example.backend.discounts.service;

import com.example.backend.discounts.dto.request.DiscountRequest;
import com.example.backend.discounts.dto.response.DiscountResponse;
import java.util.List;

public interface DiscountService {
    DiscountResponse createDiscount(DiscountRequest request);
    DiscountResponse updateDiscount(Long id, DiscountRequest request);
    DiscountResponse getDiscountById(Long id);
    List<DiscountResponse> getAllDiscounts();
    List<DiscountResponse> getActiveDiscounts();
    void deleteDiscount(Long id);
}
