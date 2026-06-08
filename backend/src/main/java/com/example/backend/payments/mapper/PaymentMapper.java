package com.example.backend.payments.mapper;

import org.mapstruct.Mapper;

import com.example.backend.payments.dto.request.PaymentRequest;
import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.payments.model.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    Payment toEntity(PaymentRequest request);
    PaymentResponse toResponse(Payment payment);
}
