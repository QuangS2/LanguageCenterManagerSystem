package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.example.backend.account.model.Role;
import com.example.backend.account.model.User;
import com.example.backend.account.repository.UserRepository;
import com.example.backend.classes.model.EntityClass;
import com.example.backend.courses.model.Course;
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
import com.example.backend.payments.service.impl.PaymentServiceImpl;
import com.example.backend.students.model.Student;
import com.example.backend.students.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceImplTest {

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private DiscountRepository discountRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PaymentMapper paymentMapper;

    private User mockUser;
    private Student mockStudent;
    private Enrollment mockEnrollment;
    private PaymentRequest request;

    @BeforeEach
    void setUp() {
        // User giả
        Role studentRole = new Role();
        studentRole.setName("STUDENT");

        mockUser = new User();
        mockUser.setId(100L);
        mockUser.setUsername("fake.student");
        mockUser.setRoles(Set.of(studentRole));

        // Student giả
        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(mockUser);

        // Enrollment lồng nhau để tránh NullPointerException
        mockEnrollment = new Enrollment();
        EntityClass mockClass = new EntityClass();
        Course mockCourse = new Course();
        mockCourse.setTuitionFee(BigDecimal.valueOf(1000000));
        mockClass.setCourse(mockCourse);

        mockEnrollment.setClassEntity(mockClass);
        mockEnrollment.setStudent(mockStudent);
        mockEnrollment.setStatus("pending");

        // Request mặc định
        request = new PaymentRequest();
        request.setStudentId(1L);
        request.setEnrollmentIds(List.of(10L));

        // MOCK MẶC ĐỊNH CHO TẤT CẢ CÁC TEST
        // lenient() để những test không dùng tới không bị báo lỗi
        // UnnecessaryStubbing
        lenient().when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(mockUser));
        lenient().when(studentRepository.findByUserId(anyLong())).thenReturn(Optional.of(mockStudent));
        lenient().when(studentRepository.findById(anyLong())).thenReturn(Optional.of(mockStudent));
    }

    @Test
    @DisplayName("Payment - StudentId does not match - Throw AccessDeniedException")
    void payment_studentIdDoesNotMatch_throwAccessDeniedException() {
        // Arrange
        request.setStudentId(999L);
        // Act
        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("student id does not match the authenticated student", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - EnrollmentId is empty - Throw IllegalArgumentException")
    void payment_enrollmentIdIsEmpty_throwIllegalArgumentException() {
        // Arrange
        request.setEnrollmentIds(Collections.emptyList());

        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("enrollmentIds cannot be null", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Student not found - Throw ResourceNotFoundException")
    void payment_studentNotFound_throwResourceNotFoundException() {
        // Arrange
        when(studentRepository.findByUserId(mockUser.getId())).thenReturn(Optional.empty());
        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("student not found", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Enrollment not found - Throw ResourceNotFoundException")
    void payment_enrollmentNotFound_throwResourceNotFoundException() {
        // Arrange
        request.setEnrollmentIds(List.of(1L, 2L));
        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("enrollment not found", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Enrollment does not belong to student - Throw IllegalArgumentException")
    void payment_enrollmentDoesNotBelongToStudent_throwIllegalArgumentException() {
        // Arrange
        Student otherStudent = new Student();
        otherStudent.setId(999L);
        mockEnrollment.setStudent(otherStudent); // Gán cho sinh viên khác

        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));
        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("enrollment does not belong to the student", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Enrollment is not pending - Throw IllegalArgumentException")
    void payment_enrollmentIsNotPending_throwIllegalArgumentException() {
        // Arrange
        mockEnrollment.setStatus("approved"); // Trạng thái sai

        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));
        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("enrollment is not pending", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Discount not found - Throw ResourceNotFoundException")
    void payment_discountNotFound_throwResourceNotFoundException() {
        // Arrange
        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));

        request.setDiscountId(999L);
        when(discountRepository.findById(request.getDiscountId())).thenReturn(Optional.empty());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("discount not found", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Discount not active - Throw IllegalArgumentException")
    void payment_discountNotActive_throwIllegalArgumentException() {
        // Arrange
        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));

        request.setDiscountId(1L);
        Discount mockDiscount = new Discount();
        mockDiscount.setActive(false); // Discount bị tắt
        when(discountRepository.findById(request.getDiscountId())).thenReturn(Optional.of(mockDiscount));
        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });
        // Assert
        assertEquals("discount is not active", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Payment with discount - Returns success with discount")
    void payment_ValidRequest_ReturnsSuccess() {
        // Arrange
        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));

        request.setDiscountId(5L);
        Discount mockDiscount = new Discount();
        mockDiscount.setId(5L);
        mockDiscount.setDiscountPercent(10);
        mockDiscount.setActive(true);
        when(discountRepository.findById(request.getDiscountId())).thenReturn(Optional.of(mockDiscount));

        Payment mockPaymentEntity = new Payment();
        lenient().when(paymentMapper.toEntity(any())).thenReturn(mockPaymentEntity);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        PaymentResponse mockResponse = PaymentResponse.builder()
                .amount(BigDecimal.valueOf(1000000))
                .finalAmount(BigDecimal.valueOf(900000))
                .build();
        when(paymentMapper.toResponse(any())).thenReturn(mockResponse);

        // Act
        PaymentResponse response = paymentService.payment(request, mockUser.getUsername());

        // Assert
        assertNotNull(response);
        assertEquals(0, BigDecimal.valueOf(900000).compareTo(response.getFinalAmount()));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Payment - Payment with no discount - Return success with full amount")
    void payment_ValidRequestNoDiscount_ReturnsSuccess() {
        // Arrange
        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));

        request.setDiscountId(null); // Không sử dụng discount

        Payment mockPaymentEntity = new Payment();
        lenient().when(paymentMapper.toEntity(any())).thenReturn(mockPaymentEntity);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        PaymentResponse mockResponse = PaymentResponse.builder()
                .amount(BigDecimal.valueOf(1000000))
                .finalAmount(BigDecimal.valueOf(1000000))
                .build();
        when(paymentMapper.toResponse(any())).thenReturn(mockResponse);

        // Act
        PaymentResponse response = paymentService.payment(request, mockUser.getUsername());

        // Assert
        assertNotNull(response);
        assertEquals(0, BigDecimal.valueOf(1000000).compareTo(response.getFinalAmount()));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Payment - Final amount is negative - Final amount set to zero")
    void payment_FinalAmountNegative_FinalAmountSetToZero() {
        // Arrange
        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));

        // Cố tình gán học phí thành số âm để ép finalAmount < 0
        mockEnrollment.getClassEntity().getCourse().setTuitionFee(BigDecimal.valueOf(-50000));
        request.setDiscountId(null);

        Payment mockPaymentEntity = new Payment();
        lenient().when(paymentMapper.toEntity(any())).thenReturn(mockPaymentEntity);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        // Mock Response cũng phải trả về 0 để khớp logic
        PaymentResponse mockResponse = PaymentResponse.builder()
                .amount(BigDecimal.valueOf(-50000))
                .finalAmount(BigDecimal.ZERO)
                .build();
        when(paymentMapper.toResponse(any())).thenReturn(mockResponse);

        // Act
        PaymentResponse response = paymentService.payment(request, mockUser.getUsername());

        // Assert
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getFinalAmount()));
    }

    @Test
    @DisplayName("Payment - EnrollmentIds is strickly null - Throw IllegalArgumentException")
    void payment_enrollmentIdsIsStrictlyNull_throwIllegalArgumentException() {
        // Arrange
        request.setEnrollmentIds(null); // Set cứng thành null thay vì emptyList

        // Act
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });

        // Assert
        assertEquals("enrollmentIds cannot be null", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Student not found by ID in request - Throw ResourceNotFoundException")
    void payment_studentNotFoundByIdInRequest_throwResourceNotFoundException() {
        // Arrange
        when(studentRepository.findById(request.getStudentId())).thenReturn(Optional.empty());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.payment(request, mockUser.getUsername());
        });

        // Assert
        assertEquals("student not found", exception.getMessage());
    }

    @Test
    @DisplayName("Payment - Role STUDENT and ADMIN - Bypasses Student Matching")
    void payment_RoleStudentAndAdmin_BypassesStudentMatching() {
        // Arrange
        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        Role adminRole = new Role();
        adminRole.setName("ADMIN");

        User dualUser = new User();
        dualUser.setId(99L);
        dualUser.setUsername("admin_student");
        dualUser.setRoles(Set.of(studentRole, adminRole));

        when(userRepository.findByUsername(dualUser.getUsername())).thenReturn(Optional.of(dualUser));

        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));
        request.setDiscountId(null);

        Payment mockPaymentEntity = new Payment();
        lenient().when(paymentMapper.toEntity(any())).thenReturn(mockPaymentEntity);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        PaymentResponse mockResponse = PaymentResponse.builder().finalAmount(BigDecimal.valueOf(1000000)).build();
        when(paymentMapper.toResponse(any())).thenReturn(mockResponse);

        // Act
        paymentService.payment(request, dualUser.getUsername());

        // Assert
        verify(studentRepository, never()).findByUserId(dualUser.getId());
    }

    @Test
    @DisplayName("Payment - Role STUDENT and STAFF - Bypasses Student Matching")
    void payment_RoleStudentAndStaff_BypassesStudentMatching() {
        // Arrange:
        Role studentRole = new Role();
        studentRole.setName("STUDENT");
        Role staffRole = new Role();
        staffRole.setName("STAFF");

        User staffUser = new User();
        staffUser.setId(88L);
        staffUser.setUsername("staff_student");
        staffUser.setRoles(Set.of(studentRole, staffRole));

        when(userRepository.findByUsername(staffUser.getUsername())).thenReturn(Optional.of(staffUser));

        when(enrollmentRepository.findAllById(request.getEnrollmentIds())).thenReturn(List.of(mockEnrollment));
        request.setDiscountId(null);

        Payment mockPaymentEntity = new Payment();
        lenient().when(paymentMapper.toEntity(any())).thenReturn(mockPaymentEntity);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        PaymentResponse mockResponse = PaymentResponse.builder().finalAmount(BigDecimal.valueOf(1000000)).build();
        when(paymentMapper.toResponse(any())).thenReturn(mockResponse);

        // Act
        paymentService.payment(request, staffUser.getUsername());

        // Assert
        verify(studentRepository, never()).findByUserId(staffUser.getId());
    }

    @Test
    @DisplayName("Payed - Payment not found - Throw ResourceNotFoundException")
    void payed_paymentNotFound_throwResourceNotFoundException() {
        // Arrange
        when(paymentRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            paymentService.payed(1L, mockUser.getUsername());
        });

        // Assert
        assertEquals("payment not found", exception.getMessage());
    }

    @Test
    @DisplayName("Payed - Payment not belong to user - Throw AccessDeniedException")
    void payed_PaymentNotBelongToUser_ThrowsAccessDeniedException() {
        // Arrange
        Payment mockPayment = new Payment();
        mockPayment.setId(1L);
        User otherUser = new User();
        otherUser.setUsername("other.fake.student"); // Tên user khác với "fake.student"

        Student otherStudent = new Student();
        otherStudent.setId(999L);
        otherStudent.setUser(otherUser);

        mockPayment.setStudent(otherStudent);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        // Act
        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> {
            paymentService.payed(1L, mockUser.getUsername()); // mockUser đang cố thanh toán bill của otherUser
        });
        // Assert
        assertEquals("payment does not belong to the authenticated student", exception.getMessage());
    }

    @Test
    @DisplayName("Payed - Valid Id - Updates status and returns success")
    void payed_ValidId_UpdatesStatusAndReturnsSuccess() {
        Payment mockPayment = new Payment();
        mockPayment.setId(1L);
        mockPayment.setStatus("pending");
        mockPayment.setStudent(mockStudent);

        mockEnrollment.setStatus("pending");
        mockPayment.setEnrollments(List.of(mockEnrollment));

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(mockPayment));

        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(1L)
                .status("paid")
                .build();
        lenient().when(paymentMapper.toResponse(any(Payment.class))).thenReturn(mockResponse);

        // Act
        PaymentResponse response = paymentService.payed(1L, mockUser.getUsername());

        // Assert
        assertNotNull(response);
        assertEquals("paid", response.getStatus());
        assertEquals("PAID", mockPayment.getStatus());
        assertEquals("ACTIVE", mockEnrollment.getStatus());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("GetAllPaymentsByStudentId - Valid request - Returns list of payments")
    void getAllPaymentsByStudentId_ValidRequest_ReturnsListOfPayments() {
        // Arrange
        Payment mockPayment = new Payment();
        mockPayment.setId(1L);
        mockPayment.setStudent(mockStudent);

        when(paymentRepository.findByStudentId(1L)).thenReturn(List.of(mockPayment));

        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(1L)
                .build();
        when(paymentMapper.toResponse(any(Payment.class))).thenReturn(mockResponse);

        // Act
        List<PaymentResponse> responses = paymentService.getAllPaymentsByStudentId(1L);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).getId());
    }
}