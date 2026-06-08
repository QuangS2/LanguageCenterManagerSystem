-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    midterm_grade DECIMAL(19, 2),
    final_grade DECIMAL(19, 2),
    comment TEXT,
    result VARCHAR(255),
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    UNIQUE KEY uk_grades_student_class (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_class_id ON grades(class_id);
