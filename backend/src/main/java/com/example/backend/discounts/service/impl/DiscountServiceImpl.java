package com.example.backend.discounts.service.impl;

import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.backend.discounts.dto.request.DiscountRequest;
import com.example.backend.discounts.dto.response.DiscountResponse;
import com.example.backend.discounts.mapper.DiscountMapper;
import com.example.backend.discounts.model.Discount;
import com.example.backend.discounts.repository.DiscountRepository;
import com.example.backend.discounts.service.DiscountService;
import com.example.backend.exception.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {
    private final DiscountRepository discountRepository;
    private final DiscountMapper discountMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"discounts", "discounts_all", "discounts_active"}, allEntries = true)
    public DiscountResponse createDiscount(DiscountRequest request) {
        // Validate discount percent is valid (0-100)
        validateDiscountPercent(request.getDiscountPercent());

        // Create and save discount
        Discount discount = discountMapper.toEntity(request);

        return discountMapper.toResponse(discountRepository.save(discount));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"discounts", "discounts_all", "discounts_active"}, allEntries = true)
    public DiscountResponse updateDiscount(Long id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));

        // Validate discount percent is valid (0-100)
        validateDiscountPercent(request.getDiscountPercent());

        // Update fields
        discount.setName(request.getName());
        discount.setDiscountPercent(request.getDiscountPercent());
        discount.setDescription(request.getDescription());
        discount.setActive(request.getActive());

        return discountMapper.toResponse(discountRepository.save(discount));
    }

    @Override
    @Cacheable(value = "discounts", key = "#id")
    public DiscountResponse getDiscountById(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        return discountMapper.toResponse(discount);
    }

    @Override
    @Cacheable(value = "discounts_all")
    public List<DiscountResponse> getAllDiscounts() {
        List<Discount> discounts = discountRepository.findAll();
        return discounts.stream()
                .map(discountMapper::toResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "discounts_active")
    public List<DiscountResponse> getActiveDiscounts() {
        List<Discount> discounts = discountRepository.findByActiveTrue();
        return discounts.stream()
                .map(discountMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"discounts", "discounts_all", "discounts_active"}, allEntries = true)
    public void deleteDiscount(Long id) {
        if (!discountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Discount not found");
        }
        discountRepository.deleteById(id);
    }

    private void validateDiscountPercent(Integer percent) {
        if (percent < 0 || percent > 100) {
            throw new IllegalArgumentException("Discount percent must be between 0 and 100");
        }
    }
}
