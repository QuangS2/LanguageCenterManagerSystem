-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(255) UNIQUE NOT NULL,
    max_students INT,
    enrolled_students INT,
    start_date DATETIME,
    end_date DATETIME,
    registration_start DATETIME,
    registration_end DATETIME,
    course_id BIGINT NOT NULL,
    teacher_id BIGINT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_classes_class_name ON classes(class_name);
CREATE INDEX idx_classes_course_id ON classes(course_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
