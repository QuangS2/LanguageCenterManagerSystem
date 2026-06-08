-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_date DATE,
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(255),
    class_id BIGINT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_schedules_class_id ON schedules(class_id);
CREATE INDEX idx_schedules_lesson_date ON schedules(lesson_date);
