package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.discounts.dto.request.DiscountRequest;
import com.example.backend.discounts.dto.response.DiscountResponse;
import com.example.backend.discounts.mapper.DiscountMapper;
import com.example.backend.discounts.model.Discount;
import com.example.backend.discounts.repository.DiscountRepository;
import com.example.backend.discounts.service.impl.DiscountServiceImpl;
import com.example.backend.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
public class DiscountServiceImplTest {

    @InjectMocks
    private DiscountServiceImpl discountService;

    @Mock
    private DiscountRepository discountRepository;

    @Mock
    private DiscountMapper discountMapper;

    private DiscountRequest request;
    private Discount discount;
    private DiscountResponse response;

    @BeforeEach
    void setUp() {
        request = new DiscountRequest();
        request.setName("Summer Sale");
        request.setDiscountPercent(15);
        request.setDescription("15% off on all courses");
        request.setActive(true);

        discount = new Discount();
        discount.setId(1L);
        discount.setName("Summer Sale");
        discount.setDiscountPercent(15);
        discount.setDescription("15% off on all courses");
        discount.setActive(true);

        response = DiscountResponse.builder()
                .id(1L)
                .name("Summer Sale")
                .discountPercent(15)
                .description("15% off on all courses")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Create discount - Valid request - Success")
    void createDiscount_ValidRequest_Success() {
        // Arrange
        when(discountMapper.toEntity(any(DiscountRequest.class))).thenReturn(discount);
        when(discountRepository.save(any(Discount.class))).thenReturn(discount);
        when(discountMapper.toResponse(any(Discount.class))).thenReturn(response);

        // Act
        DiscountResponse result = discountService.createDiscount(request);

        // Assert
        assertNotNull(result);
        assertEquals(15, result.getDiscountPercent());
        verify(discountRepository, times(1)).save(any(Discount.class));
    }

    @Test
    @DisplayName("Create discount - Percent below 0 - Throw IllegalArgumentException")
    void createDiscount_PercentBelow0_ThrowIllegalArgumentException() {
        // Arrange
        request.setDiscountPercent(-5);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> discountService.createDiscount(request));
        verify(discountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create discount - Percent above 100 - Throw IllegalArgumentException")
    void createDiscount_PercentAbove100_ThrowIllegalArgumentException() {
        // Arrange
        request.setDiscountPercent(105);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> discountService.createDiscount(request));
        verify(discountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update discount - Valid request - Success")
    void updateDiscount_ValidRequest_Success() {
        // Arrange
        when(discountRepository.findById(1L)).thenReturn(Optional.of(discount));
        when(discountRepository.save(any(Discount.class))).thenReturn(discount);
        when(discountMapper.toResponse(any(Discount.class))).thenReturn(response);

        // Act
        DiscountResponse result = discountService.updateDiscount(1L, request);

        // Assert
        assertNotNull(result);
        verify(discountRepository, times(1)).findById(1L);
        verify(discountRepository, times(1)).save(any(Discount.class));
    }

    @Test
    @DisplayName("Update discount - Not found - Throw ResourceNotFoundException")
    void updateDiscount_NotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(discountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> discountService.updateDiscount(1L, request));
        verify(discountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update discount - Percent below 0 - Throw IllegalArgumentException")
    void updateDiscount_PercentBelow0_ThrowIllegalArgumentException() {
        // Arrange
        request.setDiscountPercent(-1);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(discount));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> discountService.updateDiscount(1L, request));
        verify(discountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update discount - Percent above 100 - Throw IllegalArgumentException")
    void updateDiscount_PercentAbove100_ThrowIllegalArgumentException() {
        // Arrange
        request.setDiscountPercent(101);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(discount));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> discountService.updateDiscount(1L, request));
        verify(discountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get discount by ID - Valid ID - Success")
    void getDiscountById_ValidId_Success() {
        // Arrange
        when(discountRepository.findById(1L)).thenReturn(Optional.of(discount));
        when(discountMapper.toResponse(discount)).thenReturn(response);

        // Act
        DiscountResponse result = discountService.getDiscountById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(discountRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Get discount by ID - Not found - Throw ResourceNotFoundException")
    void getDiscountById_NotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(discountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> discountService.getDiscountById(1L));
        verify(discountMapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Get all discounts - Return list of DiscountResponse")
    void getAllDiscounts_ReturnListOfDiscountResponse() {
        // Arrange
        when(discountRepository.findAll()).thenReturn(List.of(discount));
        when(discountMapper.toResponse(any(Discount.class))).thenReturn(response);

        // Act
        List<DiscountResponse> result = discountService.getAllDiscounts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(discountRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Get active discounts - Return list of active DiscountResponse")
    void getActiveDiscounts_ReturnListOfActiveDiscountResponse() {
        // Arrange
        when(discountRepository.findByActiveTrue()).thenReturn(List.of(discount));
        when(discountMapper.toResponse(any(Discount.class))).thenReturn(response);

        // Act
        List<DiscountResponse> result = discountService.getActiveDiscounts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(discountRepository, times(1)).findByActiveTrue();
    }

    @Test
    @DisplayName("Delete discount - Valid ID - Success")
    void deleteDiscount_ValidId_Success() {
        // Arrange
        when(discountRepository.existsById(1L)).thenReturn(true);

        // Act
        discountService.deleteDiscount(1L);

        // Assert
        verify(discountRepository, times(1)).existsById(1L);
        verify(discountRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Delete discount - Not found - Throw ResourceNotFoundException")
    void deleteDiscount_NotFound_ThrowResourceNotFoundException() {
        // Arrange
        when(discountRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> discountService.deleteDiscount(1L));
        verify(discountRepository, never()).deleteById(any());
    }
}