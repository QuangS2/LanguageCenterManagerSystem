-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(19, 2),
    date DATE,
    method VARCHAR(255),
    status VARCHAR(255),
    final_amount DECIMAL(19, 2),
    payment_date DATE,
    student_id BIGINT NOT NULL,
    discount_id BIGINT,
    class_id BIGINT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_discount_id ON payments(discount_id);
CREATE INDEX idx_payments_class_id ON payments(class_id);
