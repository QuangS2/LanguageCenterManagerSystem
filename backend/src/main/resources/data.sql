INSERT INTO roles (name) VALUES
('ADMIN'),
('TEACHER'),
('STUDENT'),
('STAFF');

INSERT INTO users (fullname, age, email, username, password, active) VALUES
('Admin System', 30, 'admin@gmail.com', 'admin', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Nguyen Van A', 28, 'teacher1@gmail.com', 'nva.teacher', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Tran Thi B', 29, 'teacher2@gmail.com', 'ttb.teacher', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Le Van C', 20, 'student1@gmail.com', 'lvc.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Pham Thi D', 21, 'student2@gmail.com', 'ptd.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Hoang Van E', 22, 'student3@gmail.com', 'hve.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Nguyen Van F', 25, 'staff1@gmail.com', 'nvf.staff', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Do Thi G', 19, 'student4@gmail.com', 'dtg.student', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE),
('Pham Van H', 32, 'teacher3@gmail.com', 'pvh.teacher', '$2a$10$pbtDNm7cwwohxIJ2cTj3numxgp5qA4OzdWbNyZYz1eRaeszV961Ke', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE username='admin'), (SELECT id FROM roles WHERE name='ADMIN')),
((SELECT id FROM users WHERE username='nva.teacher'), (SELECT id FROM roles WHERE name='TEACHER')),
((SELECT id FROM users WHERE username='ttb.teacher'), (SELECT id FROM roles WHERE name='TEACHER')),
((SELECT id FROM users WHERE username='lvc.student'), (SELECT id FROM roles WHERE name='STUDENT')),
((SELECT id FROM users WHERE username='ptd.student'), (SELECT id FROM roles WHERE name='STUDENT')),
((SELECT id FROM users WHERE username='hve.student'), (SELECT id FROM roles WHERE name='STUDENT')),
((SELECT id FROM users WHERE username='nvf.staff'), (SELECT id FROM roles WHERE name='STAFF')),
((SELECT id FROM users WHERE username='dtg.student'), (SELECT id FROM roles WHERE name='STUDENT')),
((SELECT id FROM users WHERE username='pvh.teacher'), (SELECT id FROM roles WHERE name='TEACHER'));

INSERT INTO teachers (specialization, user_id) VALUES
('General English', (SELECT id FROM users WHERE username='nva.teacher')),
('IELTS', (SELECT id FROM users WHERE username='ttb.teacher')),
('TOEIC', (SELECT id FROM users WHERE username='pvh.teacher'));

INSERT INTO students (date_of_birth, phone, address, user_id) VALUES
('2006-01-10', '0900000001', 'District 1, HCMC', (SELECT id FROM users WHERE username='lvc.student')),
('2005-03-22', '0900000002', 'District 3, HCMC', (SELECT id FROM users WHERE username='ptd.student')),
('2004-07-14', '0900000003', 'Thu Duc, HCMC', (SELECT id FROM users WHERE username='hve.student')),
('2007-09-19', '0900000004', 'Binh Thanh, HCMC', (SELECT id FROM users WHERE username='dtg.student'));

INSERT INTO courses (name, description, level, duration_weeks, duration, tuition_fee, created_by_id) VALUES
('English Foundation', 'Basic communication skills', 'BEGINNER', '12', '3 months', 2000000, (SELECT id FROM users WHERE username='admin')),
('IELTS Intensive', 'Target band 6.5+', 'INTERMEDIATE', '16', '4 months', 4000000, (SELECT id FROM users WHERE username='admin')),
('TOEIC Bridge', 'Focus on workplace communication', 'INTERMEDIATE', '10', '2.5 months', 2500000, (SELECT id FROM users WHERE username='admin')),
('Chinese HSK 1-2', 'Cơ bản cho người mới bắt đầu', 'BEGINNER', '12', '3 months', 3000000, (SELECT id FROM users WHERE username='admin')),
('Japanese N5 Intensive', 'Tiếng Nhật sơ cấp cấp tốc', 'BEGINNER', '14', '3.5 months', 3500000, (SELECT id FROM users WHERE username='admin')),
('Korean TOPIK I', 'Luyện thi chứng chỉ TOPIK sơ cấp', 'BEGINNER', '10', '2.5 months', 2800000, (SELECT id FROM users WHERE username='admin')),
('French for Travelers', 'Tiếng Pháp giao tiếp du lịch', 'BEGINNER', '8', '2 months', 3200000, (SELECT id FROM users WHERE username='admin')),
('German A1 Foundation', 'Tiếng Đức nền tảng', 'BEGINNER', '16', '4 months', 4000000, (SELECT id FROM users WHERE username='admin')),
('Spanish Basic Giao Tiếp', 'Giao tiếp tiếng Tây Ban Nha cơ bản', 'BEGINNER', '12', '3 months', 3100000, (SELECT id FROM users WHERE username='admin')),
('Business English Master', 'Tiếng Anh chuyên ngành thương mại', 'INTERMEDIATE', '12', '3 months', 4500000, (SELECT id FROM users WHERE username='admin')),
('Chinese HSK 3-4', 'Tiếng Trung trung cấp', 'INTERMEDIATE', '16', '4 months', 5000000, (SELECT id FROM users WHERE username='admin')),
('Japanese N4 Advance', 'Tiếng Nhật trung cấp thấp', 'INTERMEDIATE', '14', '3.5 months', 4200000, (SELECT id FROM users WHERE username='admin')),
('Korean TOPIK II', 'Luyện thi TOPIK trung cấp', 'INTERMEDIATE', '12', '3 months', 3800000, (SELECT id FROM users WHERE username='admin')),
('IELTS Master 7.5+', 'Luyện thi IELTS band điểm cao', 'ADVANCED', '20', '5 months', 6500000, (SELECT id FROM users WHERE username='admin')),
('French B1 Intermediate', 'Tiếng Pháp trung cấp bậc 3', 'INTERMEDIATE', '16', '4 months', 4800000, (SELECT id FROM users WHERE username='admin'));

INSERT INTO classes (class_name, start_date, end_date, registration_start, registration_end, max_students, enrolled_students, course_id, teacher_id) VALUES
('ENG-A1-01', '2026-05-04 18:00:00', '2026-07-27 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 25, 2, (SELECT id FROM courses WHERE name='English Foundation'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher')),
('IELTS-B1-01', '2026-05-05 18:00:00', '2026-08-25 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 20, 2, (SELECT id FROM courses WHERE name='IELTS Intensive'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher')),
('TOEIC-C1-01', '2026-05-06 19:00:00', '2026-07-29 21:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 20, 1, (SELECT id FROM courses WHERE name='TOEIC Bridge'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher')),
('HSK1-01', '2026-05-07 18:00:00', '2026-07-30 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 18, 0, (SELECT id FROM courses WHERE name='Chinese HSK 1-2'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher')),
('JPN-N5-01', '2026-05-08 18:30:00', '2026-08-14 20:30:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 18, 0, (SELECT id FROM courses WHERE name='Japanese N5 Intensive'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher')),
('TOPIK1-01', '2026-05-09 08:30:00', '2026-07-18 10:30:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 20, 0, (SELECT id FROM courses WHERE name='Korean TOPIK I'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher')),
('FRA-TRAVEL-01', '2026-05-10 09:00:00', '2026-06-28 11:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 16, 0, (SELECT id FROM courses WHERE name='French for Travelers'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher')),
('GER-A1-01', '2026-05-11 19:00:00', '2026-09-01 21:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 18, 0, (SELECT id FROM courses WHERE name='German A1 Foundation'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher')),
('SPA-BASIC-01', '2026-05-12 18:00:00', '2026-08-04 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 18, 0, (SELECT id FROM courses WHERE name='Spanish Basic Giao Tiếp'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher')),
('BIZ-ENG-01', '2026-05-13 19:15:00', '2026-08-05 21:15:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 22, 0, (SELECT id FROM courses WHERE name='Business English Master'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher')),
('HSK3-01', '2026-05-14 18:00:00', '2026-09-03 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 18, 0, (SELECT id FROM courses WHERE name='Chinese HSK 3-4'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher')),
('JPN-N4-01', '2026-05-15 18:30:00', '2026-08-21 20:30:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 18, 0, (SELECT id FROM courses WHERE name='Japanese N4 Advance'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher')),
('TOPIK2-01', '2026-05-16 14:00:00', '2026-08-08 16:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 20, 0, (SELECT id FROM courses WHERE name='Korean TOPIK II'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='nva.teacher')),
('IELTS-MASTER-01', '2026-05-17 18:00:00', '2026-10-04 20:00:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 15, 0, (SELECT id FROM courses WHERE name='IELTS Master 7.5+'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='ttb.teacher')),
('FRA-B1-01', '2026-05-18 18:15:00', '2026-09-07 20:15:00', '2026-04-01 00:00:00', '2026-05-31 23:59:59', 16, 0, (SELECT id FROM courses WHERE name='French B1 Intermediate'), (SELECT t.id FROM teachers t JOIN users u ON t.user_id=u.id WHERE u.username='pvh.teacher'));

INSERT INTO discounts (name, description, discount_percent, active) VALUES
('EARLY_BIRD_10', 'Early registration discount', 10, TRUE),
('SCHOLARSHIP_20', 'Scholarship discount', 20, TRUE),
('INACTIVE_5', 'Old campaign', 5, FALSE);

INSERT INTO schedules (lesson_date, start_time, end_time, room_number, class_id) VALUES
('2026-05-04', '18:00:00', '20:00:00', 'A101', (SELECT id FROM classes WHERE class_name='ENG-A1-01')),
('2026-05-07', '18:00:00', '20:00:00', 'A101', (SELECT id FROM classes WHERE class_name='ENG-A1-01')),
('2026-05-05', '18:00:00', '20:00:00', 'B201', (SELECT id FROM classes WHERE class_name='IELTS-B1-01')),
('2026-05-08', '18:00:00', '20:00:00', 'B201', (SELECT id FROM classes WHERE class_name='IELTS-B1-01')),
('2026-05-06', '19:00:00', '21:00:00', 'C301', (SELECT id FROM classes WHERE class_name='TOEIC-C1-01')),
('2026-05-09', '19:00:00', '21:00:00', 'C301', (SELECT id FROM classes WHERE class_name='TOEIC-C1-01')),
('2026-05-07', '18:00:00', '20:00:00', 'A203', (SELECT id FROM classes WHERE class_name='HSK1-01')),
('2026-05-10', '18:00:00', '20:00:00', 'A203', (SELECT id FROM classes WHERE class_name='HSK1-01')),
('2026-05-08', '18:30:00', '20:30:00', 'J102', (SELECT id FROM classes WHERE class_name='JPN-N5-01')),
('2026-05-11', '18:30:00', '20:30:00', 'J102', (SELECT id FROM classes WHERE class_name='JPN-N5-01')),
('2026-05-09', '08:30:00', '10:30:00', 'K205', (SELECT id FROM classes WHERE class_name='TOPIK1-01')),
('2026-05-16', '08:30:00', '10:30:00', 'K205', (SELECT id FROM classes WHERE class_name='TOPIK1-01')),
('2026-05-10', '09:00:00', '11:00:00', 'F109', (SELECT id FROM classes WHERE class_name='FRA-TRAVEL-01')),
('2026-05-17', '09:00:00', '11:00:00', 'F109', (SELECT id FROM classes WHERE class_name='FRA-TRAVEL-01')),
('2026-05-11', '19:00:00', '21:00:00', 'G401', (SELECT id FROM classes WHERE class_name='GER-A1-01')),
('2026-05-14', '19:00:00', '21:00:00', 'G401', (SELECT id FROM classes WHERE class_name='GER-A1-01')),
('2026-05-12', '18:00:00', '20:00:00', 'S210', (SELECT id FROM classes WHERE class_name='SPA-BASIC-01')),
('2026-05-15', '18:00:00', '20:00:00', 'S210', (SELECT id FROM classes WHERE class_name='SPA-BASIC-01')),
('2026-05-13', '19:15:00', '21:15:00', 'E305', (SELECT id FROM classes WHERE class_name='BIZ-ENG-01')),
('2026-05-16', '19:15:00', '21:15:00', 'E305', (SELECT id FROM classes WHERE class_name='BIZ-ENG-01')),
('2026-05-14', '18:00:00', '20:00:00', 'C208', (SELECT id FROM classes WHERE class_name='HSK3-01')),
('2026-05-17', '18:00:00', '20:00:00', 'C208', (SELECT id FROM classes WHERE class_name='HSK3-01')),
('2026-05-15', '18:30:00', '20:30:00', 'J204', (SELECT id FROM classes WHERE class_name='JPN-N4-01')),
('2026-05-18', '18:30:00', '20:30:00', 'J204', (SELECT id FROM classes WHERE class_name='JPN-N4-01')),
('2026-05-16', '14:00:00', '16:00:00', 'K303', (SELECT id FROM classes WHERE class_name='TOPIK2-01')),
('2026-05-23', '14:00:00', '16:00:00', 'K303', (SELECT id FROM classes WHERE class_name='TOPIK2-01')),
('2026-05-17', '18:00:00', '20:00:00', 'I501', (SELECT id FROM classes WHERE class_name='IELTS-MASTER-01')),
('2026-05-20', '18:00:00', '20:00:00', 'I501', (SELECT id FROM classes WHERE class_name='IELTS-MASTER-01')),
('2026-05-18', '18:15:00', '20:15:00', 'F207', (SELECT id FROM classes WHERE class_name='FRA-B1-01')),
('2026-05-21', '18:15:00', '20:15:00', 'F207', (SELECT id FROM classes WHERE class_name='FRA-B1-01'));

INSERT INTO payments (amount, final_amount, date, payment_date, method, status, student_id, class_id, discount_id) VALUES
(2000000, 1800000, '2026-04-02', '2026-04-02', 'BANK_TRANSFER', 'PAID', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01'), (SELECT id FROM discounts WHERE name='EARLY_BIRD_10')),
(2000000, 2000000, '2026-04-03', NULL, 'CASH', 'PENDING', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='ptd.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01'), NULL),
(4000000, 3200000, '2026-04-06', '2026-04-06', 'MOMO', 'PAID', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='IELTS-B1-01'), (SELECT id FROM discounts WHERE name='SCHOLARSHIP_20')),
(2500000, 2500000, '2026-04-11', '2026-04-11', 'BANK_TRANSFER', 'PAID', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='hve.student')), (SELECT id FROM classes WHERE class_name='TOEIC-C1-01'), NULL);

INSERT INTO enrollments (enrollment_date, status, student_id, class_id, payment_id) VALUES
('2026-04-02', 'ACTIVE', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01'), (SELECT id FROM payments WHERE student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')) AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1)),
('2026-04-03', 'PENDING_PAYMENT', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='ptd.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01'), (SELECT id FROM payments WHERE student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='ptd.student')) AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1)),
('2026-04-06', 'ACTIVE', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='IELTS-B1-01'), (SELECT id FROM payments WHERE student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')) AND class_id=(SELECT id FROM classes WHERE class_name='IELTS-B1-01') LIMIT 1)),
('2026-04-11', 'ACTIVE', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='hve.student')), (SELECT id FROM classes WHERE class_name='TOEIC-C1-01'), (SELECT id FROM payments WHERE student_id=(SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='hve.student')) AND class_id=(SELECT id FROM classes WHERE class_name='TOEIC-C1-01') LIMIT 1)),
('2026-04-12', 'PENDING_PAYMENT', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='dtg.student')), (SELECT id FROM classes WHERE class_name='IELTS-B1-01'), NULL);

INSERT INTO grades (midterm_grade, final_grade, result, comment, student_id, class_id) VALUES
(7.0, 8.0, 'PASS', 'Stable progress', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01')),
(5.0, 4.5, 'FAIL', 'Need more practice', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='ptd.student')), (SELECT id FROM classes WHERE class_name='ENG-A1-01')),
(6.5, 7.0, 'PASS', 'Good performance', (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student')), (SELECT id FROM classes WHERE class_name='IELTS-B1-01'));

INSERT INTO attendance (status, schedule_id, student_id) VALUES
('PRESENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-04' AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student'))),
('ABSENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-04' AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='ptd.student'))),
('PRESENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-07' AND class_id=(SELECT id FROM classes WHERE class_name='ENG-A1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student'))),
('PRESENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-05' AND class_id=(SELECT id FROM classes WHERE class_name='IELTS-B1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='lvc.student'))),
('PRESENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-05' AND class_id=(SELECT id FROM classes WHERE class_name='IELTS-B1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='dtg.student'))),
('PRESENT', (SELECT id FROM schedules WHERE lesson_date='2026-05-06' AND class_id=(SELECT id FROM classes WHERE class_name='TOEIC-C1-01') LIMIT 1), (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE username='hve.student')));

-- Note: IDs are now auto-generated; references use subqueries to locate inserted rows.
