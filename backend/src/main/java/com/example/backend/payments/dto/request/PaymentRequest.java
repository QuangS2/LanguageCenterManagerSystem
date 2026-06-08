package com.example.backend.payments.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class PaymentRequest {

    private Long studentId;
    private List<Long> enrollmentIds;
    private Long discountId;
    private BigDecimal amount;
    private LocalDateTime date;
    private String method;
    private String status;
}
