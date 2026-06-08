package com.example.backend.payments.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import com.example.backend.account.model.User;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.account.model.Role;
import com.example.backend.discounts.model.Discount;
import com.example.backend.discounts.repository.DiscountRepository;
import com.example.backend.enrollments.model.Enrollment;
import com.example.backend.enrollments.repository.EnrollmentRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.payments.dto.request.PaymentRequest;
import com.example.backend.payments.dto.response.PaymentResponse;
import com.example.backend.payments.mapper.PaymentMapper;
import com.example.backend.payments.model.Payment;
import com.example.backend.payments.repository.PaymentRepository;
import com.example.backend.payments.service.PaymentService;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    // repository
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DiscountRepository discountRepository;
    private final UserRepository userRepository;
    // mapper
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public PaymentResponse payment(PaymentRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("user not found"));

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        if (roleNames.contains("STUDENT") && !roleNames.contains("ADMIN") && !roleNames.contains("STAFF")) {
            Student student = studentRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("student not found"));
            if (!student.getId().equals(request.getStudentId())) {
                throw new AccessDeniedException("student id does not match the authenticated student");
            }
        }

        return createPayment(request);
    }

    private PaymentResponse createPayment(PaymentRequest request) {
        // if enrollmentIds is null, throw exception
        if (request.getEnrollmentIds() == null || request.getEnrollmentIds().isEmpty()) {
            throw new IllegalArgumentException("enrollmentIds cannot be null");
        }
        // get student, if not found, throw exception
        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        if (student == null) {
            throw new ResourceNotFoundException("student not found");
        }
        // get list all enrollments, throw if one of them is not found
        List<Enrollment> enrollments = enrollmentRepository.findAllById(request.getEnrollmentIds());
        if (enrollments.size() != request.getEnrollmentIds().size()) {
            throw new ResourceNotFoundException("enrollment not found");
        }
        // validate that all enrollments belong to the student
        for (Enrollment enrollment : enrollments) {
            if (!enrollment.getStudent().getId().equals(student.getId())) {
                throw new IllegalArgumentException("enrollment does not belong to the student");
            }
            if (!isPendingEnrollmentStatus(enrollment.getStatus())) {
                throw new IllegalArgumentException("enrollment is not pending");
            }
        }

        // check discount, if not found and provided, throw exception
        Discount discount = null;
        if (request.getDiscountId() != null) {
            discount = discountRepository.findById(request.getDiscountId()).orElse(null);
            if (discount == null) {
                throw new ResourceNotFoundException("discount not found");
            }
            // validate discount is active
            if (!discount.getActive()) {
                throw new IllegalArgumentException("discount is not active");
            }
        }
        // calculate total price
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Enrollment enrollment : enrollments) {
            totalPrice = totalPrice.add(enrollment.getClassEntity().getCourse().getTuitionFee());
        }

        // Store original amount (snapshot at payment time)
        BigDecimal finalAmount = totalPrice;

        // Apply discount
        if (discount != null) {
            BigDecimal discountAmount = totalPrice
                    .multiply(BigDecimal.valueOf(discount.getDiscountPercent()).divide(BigDecimal.valueOf(100)));
            finalAmount = totalPrice.subtract(discountAmount);
        }

        // Ensure final amount is not negative
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        Payment payment = paymentMapper.toEntity(request);
        payment.setStudent(student);
        payment.setEnrollments(enrollments);
        payment.setStatus("PENDING");
        payment.setDiscount(discount);
        payment.setAmount(totalPrice);
        payment.setFinalAmount(finalAmount);
        payment.setDate(request.getDate() != null ? request.getDate().toLocalDate() : LocalDate.now());
        payment.setClassEntity(enrollments.size() == 1 ? enrollments.get(0).getClassEntity() : null);

        return paymentMapper.toResponse(paymentRepository.save(payment));

    }

    @Override
    @Transactional
    public PaymentResponse payed(Long id, String username) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment == null) {
            throw new ResourceNotFoundException("payment not found");
        }
        // check if the payment belongs to the student
        if (!payment.getStudent().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("payment does not belong to the authenticated student");
        }
        // update status
        payment.setStatus("PAID");
        payment.setPaymentDate(LocalDate.now());
        for (Enrollment enrollment : payment.getEnrollments()) {
            enrollment.setStatus("ACTIVE");
            enrollment.setPayment(payment);
            enrollmentRepository.save(enrollment);
        }
        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public List<PaymentResponse> getAllPaymentsByStudentId(Long studentId) {
        List<Payment> payments = paymentRepository.findByStudentId(studentId);
        return payments.stream().map(paymentMapper::toResponse).toList();
    }

    private boolean isPendingEnrollmentStatus(String status) {
        if (status == null) {
            return false;
        }

        String normalizedStatus = status.trim().toUpperCase();
        return normalizedStatus.equals("PENDING")
                || normalizedStatus.equals("PENDING_PAYMENT");
    }

}
