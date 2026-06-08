package com.example.backend.payments.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PaymentResponse {
    
    private Long id;
    private BigDecimal amount;
    private BigDecimal finalAmount;
    private LocalDateTime date;
    private String method;
    private String status;
    // private Long studentId; // studentResponse
    // private List<EnrollResponse> enrollments;
    // private Long discountId; // discountResponse
}
