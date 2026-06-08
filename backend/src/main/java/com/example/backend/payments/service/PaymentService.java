package com.example.backend.payments.service;

import java.util.List;

import com.example.backend.payments.dto.request.PaymentRequest;
import com.example.backend.payments.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse payment(PaymentRequest request, String username);

    PaymentResponse payed(Long id, String username);

    // get all payments by id student
    List<PaymentResponse> getAllPaymentsByStudentId(Long studentId);

}
