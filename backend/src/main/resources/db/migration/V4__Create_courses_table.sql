-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    duration VARCHAR(255),
    tuition_fee DECIMAL(19, 2),
    duration_weeks VARCHAR(255),
    level VARCHAR(255),
    created_by_id BIGINT,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_created_by_id ON courses(created_by_id);
