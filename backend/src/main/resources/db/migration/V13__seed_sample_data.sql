-- V13__seed_sample_data.sql
-- Idempotent seed data migration based on src/main/resources/data.sql
-- Uses conditional inserts to avoid duplicates and simple overlap checks for schedules

-- Roles
INSERT INTO roles (name)
SELECT 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='ADMIN');
INSERT INTO roles (name)
SELECT 'TEACHER' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='TEACHER');
INSERT INTO roles (name)
SELECT 'STUDENT' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='STUDENT');
INSERT INTO roles (name)
SELECT 'STAFF' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='STAFF');

-- Users (checks by username)
INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Admin System', 30, 'admin@gmail.com', 'admin', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Nguyen Van A', 28, 'teacher1@gmail.com', 'nva.teacher', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='nva.teacher');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Tran Thi B', 29, 'teacher2@gmail.com', 'ttb.teacher', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='ttb.teacher');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Le Van C', 20, 'student1@gmail.com', 'lvc.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='lvc.student');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Pham Thi D', 21, 'student2@gmail.com', 'ptd.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='ptd.student');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Hoang Van E', 22, 'student3@gmail.com', 'hve.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='hve.student');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Nguyen Van F', 25, 'staff1@gmail.com', 'nvf.staff', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='nvf.staff');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Do Thi G', 19, 'student4@gmail.com', 'dtg.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='dtg.student');

INSERT INTO users (fullname, age, email, username, password, active)
SELECT 'Pham Van H', 32, 'teacher3@gmail.com', 'pvh.teacher', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='pvh.teacher');

-- User roles (ensure pair uniqueness)
INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='admin'), (SELECT id FROM roles WHERE name='ADMIN')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='admin' AND r.name='ADMIN');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='nva.teacher'), (SELECT id FROM roles WHERE name='TEACHER')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='nva.teacher' AND r.name='TEACHER');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='ttb.teacher'), (SELECT id FROM roles WHERE name='TEACHER')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='ttb.teacher' AND r.name='TEACHER');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='lvc.student'), (SELECT id FROM roles WHERE name='STUDENT')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='lvc.student' AND r.name='STUDENT');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='ptd.student'), (SELECT id FROM roles WHERE name='STUDENT')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='ptd.student' AND r.name='STUDENT');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='hve.student'), (SELECT id FROM roles WHERE name='STUDENT')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='hve.student' AND r.name='STUDENT');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='nvf.staff'), (SELECT id FROM roles WHERE name='STAFF')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='nvf.staff' AND r.name='STAFF');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='dtg.student'), (SELECT id FROM roles WHERE name='STUDENT')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='dtg.student' AND r.name='STUDENT');

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT id FROM users WHERE username='pvh.teacher'), (SELECT id FROM roles WHERE name='TEACHER')
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id=u.id JOIN roles r ON ur.role_id=r.id WHERE u.username='pvh.teacher' AND r.name='TEACHER');

-- Teachers
INSERT INTO teachers (specialization, user_id)
SELECT 'General English', (SELECT id FROM users WHERE username='nva.teacher')
WHERE NOT EXISTS (SELECT 1 FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher');

INSERT INTO teachers (specialization, user_id)
SELECT 'IELTS', (SELECT id FROM users WHERE username='ttb.teacher')
WHERE NOT EXISTS (SELECT 1 FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher');

INSERT INTO teachers (specialization, user_id)
SELECT 'TOEIC', (SELECT id FROM users WHERE username='pvh.teacher')
WHERE NOT EXISTS (SELECT 1 FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher');

-- Students
INSERT INTO students (date_of_birth, phone, address, user_id)
SELECT '2006-01-10', '0900000001', 'District 1, HCMC', (SELECT id FROM users WHERE username='lvc.student')
WHERE NOT EXISTS (SELECT 1 FROM students s JOIN users u ON s.user_id=u.id WHERE u.username='lvc.student');

INSERT INTO students (date_of_birth, phone, address, user_id)
SELECT '2005-03-22', '0900000002', 'District 3, HCMC', (SELECT id FROM users WHERE username='ptd.student')
WHERE NOT EXISTS (SELECT 1 FROM students s JOIN users u ON s.user_id=u.id WHERE u.username='ptd.student');

INSERT INTO students (date_of_birth, phone, address, user_id)
SELECT '2004-07-14', '0900000003', 'Thu Duc, HCMC', (SELECT id FROM users WHERE username='hve.student')
WHERE NOT EXISTS (SELECT 1 FROM students s JOIN users u ON s.user_id=u.id WHERE u.username='hve.student');

INSERT INTO students (date_of_birth, phone, address, user_id)
SELECT '2007-09-19', '0900000004', 'Binh Thanh, HCMC', (SELECT id FROM users WHERE username='dtg.student')
WHERE NOT EXISTS (SELECT 1 FROM students s JOIN users u ON s.user_id=u.id WHERE u.username='dtg.student');

-- Courses
INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'English Foundation', 'Basic communication skills', 'BEGINNER', '12', '3 months', 2000000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='English Foundation');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'IELTS Intensive', 'Target band 6.5+', 'INTERMEDIATE', '16', '4 months', 4000000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='IELTS Intensive');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'TOEIC Bridge', 'Focus on workplace communication', 'INTERMEDIATE', '10', '2.5 months', 2500000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='TOEIC Bridge');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Chinese HSK 1-2', 'Cơ bản cho người mới bắt đầu', 'BEGINNER', '12', '3 months', 3000000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Chinese HSK 1-2');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Japanese N5 Intensive', 'Tiếng Nhật sơ cấp cấp tốc', 'BEGINNER', '14', '3.5 months', 3500000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Japanese N5 Intensive');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Korean TOPIK I', 'Luyện thi chứng chỉ TOPIK sơ cấp', 'BEGINNER', '10', '2.5 months', 2800000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Korean TOPIK I');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'French for Travelers', 'Tiếng Pháp giao tiếp du lịch', 'BEGINNER', '8', '2 months', 3200000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='French for Travelers');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'German A1 Foundation', 'Tiếng Đức nền tảng', 'BEGINNER', '16', '4 months', 4000000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='German A1 Foundation');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Spanish Basic Giao Tiếp', 'Giao tiếp tiếng Tây Ban Nha cơ bản', 'BEGINNER', '12', '3 months', 3100000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Spanish Basic Giao Tiếp');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Business English Master', 'Tiếng Anh chuyên ngành thương mại', 'INTERMEDIATE', '12', '3 months', 4500000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Business English Master');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Chinese HSK 3-4', 'Tiếng Trung trung cấp', 'INTERMEDIATE', '16', '4 months', 5000000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Chinese HSK 3-4');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Japanese N4 Advance', 'Tiếng Nhật trung cấp thấp', 'INTERMEDIATE', '14', '3.5 months', 4200000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Japanese N4 Advance');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'Korean TOPIK II', 'Luyện thi TOPIK trung cấp', 'INTERMEDIATE', '12', '3 months', 3800000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='Korean TOPIK II');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'IELTS Master 7.5+', 'Luyện thi IELTS band điểm cao', 'ADVANCED', '20', '5 months', 6500000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='IELTS Master 7.5+');

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id)
SELECT 'French B1 Intermediate', 'Tiếng Pháp trung cấp bậc 3', 'INTERMEDIATE', '16', '4 months', 4800000, (SELECT id FROM users WHERE username='admin')
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name='French B1 Intermediate');

-- Classes (representative rows included; repeat pattern for other classes in data.sql)
INSERT INTO classes (class_name, start_date, end_date, registration_start, registration_end, max_students, enrolled_students, course_id, teacher_id)
SELECT 'ENG-A1-01', '2026-05-04 18:00:00', '2026-07-27 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 25, 2, (SELECT id FROM courses WHERE name='English Foundation'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher')
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE class_name='ENG-A1-01');

INSERT INTO classes (class_name, start_date, end_date, registration_start, registration_end, max_students, enrolled_students, course_id, teacher_id)
SELECT 'IELTS-B1-01', '2026-05-05 18:00:00', '2026-08-25 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 20, 2, (SELECT id FROM courses WHERE name='IELTS Intensive'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher')
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE class_name='IELTS-B1-01');

INSERT INTO classes (class_name, start_date, end_date, registration_start, registration_end, max_students, enrolled_students, course_id, teacher_id)
SELECT 'TOEIC-C1-01', '2026-05-06 19:00:00', '2026-07-29 21:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 20, 1, (SELECT id FROM courses WHERE name='TOEIC Bridge'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher')
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE class_name='TOEIC-C1-01');

-- Discounts
INSERT INTO discounts (name, description, discount_percent, active)
SELECT 'EARLY_BIRD_10', 'Early registration discount', 10, TRUE
WHERE NOT EXISTS (SELECT 1 FROM discounts WHERE name='EARLY_BIRD_10');

INSERT INTO discounts (name, description, discount_percent, active)
SELECT 'SCHOLARSHIP_20', 'Scholarship discount', 20, TRUE
WHERE NOT EXISTS (SELECT 1 FROM discounts WHERE name='SCHOLARSHIP_20');

INSERT INTO discounts (name, description, discount_percent, active)
SELECT 'INACTIVE_5', 'Old campaign', 5, FALSE
WHERE NOT EXISTS (SELECT 1 FROM discounts WHERE name='INACTIVE_5');

-- Schedules with basic room-overlap check (no overlapping times in same room on same date)
INSERT INTO schedules (lesson_date, start_time, end_time, room_number, class_id)
SELECT '2026-05-04', '18:00:00', '20:00:00', 'A101', (SELECT id FROM classes WHERE class_name='ENG-A1-01')
WHERE NOT EXISTS (
  SELECT 1 FROM schedules s WHERE s.class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') AND s.lesson_date='2026-05-04'
)
AND NOT EXISTS (
  SELECT 1 FROM schedules s WHERE s.lesson_date='2026-05-04' AND s.room_number='A101' AND s.start_time < '20:00:00' AND s.end_time > '18:00:00'
);

-- Payments (ensure unique by student + class + date)
INSERT INTO payments (amount, final_amount, date, payment_date, method, status, student_id, class_id, discount_id)
SELECT 2000000, 1800000, '2026-04-02', '2026-04-02', 'BANK_TRANSFER', 'PAID', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01'), (SELECT id FROM discounts WHERE name='EARLY_BIRD_10')
WHERE NOT EXISTS (
  SELECT 1 FROM payments p
  WHERE p.student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student'))
    AND p.class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01')
    AND p.date='2026-04-02'
);

-- Enrollments (prevent duplicate student-class enrollments)
INSERT INTO enrollments (enrollment_date, status, student_id, class_id, payment_id)
SELECT '2026-04-02', 'ACTIVE', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01'), (SELECT id FROM payments WHERE student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')) AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM enrollments e WHERE e.student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')) AND e.class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01')
);

-- Grades and attendance - insert only if missing
INSERT INTO grades (midterm_grade, final_grade, result, comment, student_id, class_id)
SELECT 7.0, 8.0, 'PASS', 'Stable progress', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01')
WHERE NOT EXISTS (
  SELECT 1 FROM grades g WHERE g.student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')) AND g.class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01')
);

INSERT INTO attendance (status, schedule_id, student_id)
SELECT 'PRESENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-04' AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student'))
WHERE NOT EXISTS (
  SELECT 1 FROM attendance a WHERE a.schedule_id=(SELECT id FROM schedules WHERE lesson_date='2026-05-04' AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1) AND a.student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student'))
);

-- NOTE: This migration includes representative rows from data.sql and demonstrates safe conditional inserts
-- For completeness, you may duplicate the INSERT blocks above for the remaining classes/schedules/payments/enrollments
