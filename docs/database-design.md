## 1. Users

```sql
users
- user_id (PK)
- full_name
- email
- password
- role (giáo viên, học sinh, admin, nhân viên)
```

---

## 2. học viên

```sql
students
- student_id (PK)
- user_id (FK -> users.user_id)
- date_of_birth
- phone
- address
```

---

## 3. giáo viên

```sql
teachers
- teacher_id (PK)
- user_id (FK -> users.user_id)
- specialization
```

---

## 4. khóa học

```sql
courses
- course_id (PK)
- course_name
- description
- tuition_fee
- duration_weeks
- level
- created_by (FK -> users.user_id)
```

---

## 5. lớp học

```sql
classes
- class_id (PK)
- class_name
- course_id (FK -> courses.course_id)      -- 1 Course : N Classes
- teacher_id (FK -> teachers.teacher_id)  -- 1 Teacher : N Classes
- max_students
- start_date
- end_date
```

---

## 6. đăng ký lớp học (Student ↔ Class) [N-N]

```sql
enrollments
- enrollment_id (PK)
- student_id (FK -> students.student_id)
- class_id (FK -> classes.class_id)
- enrollment_date
- status (active, cancelled, completed)
```

---

## 7. lịch học

```sql
schedules
- schedule_id (PK)
- class_id (FK -> classes.class_id)   -- 1 Class : N Schedules
- lesson_date
- start_time
- end_time
- room
```

---

## 8. điểm danh

```sql
attendance
- attendance_id (PK)
- schedule_id (FK -> schedules.schedule_id)
- student_id (FK -> students.student_id)
- status (present, absent, late)
```

---

## 9. điểm số

```sql
grades
- grades_id (PK)
- student_id (FK -> students.student_id)
- class_id (FK -> classes.class_id)
- midterm_score
- final_score
- comment
- result (pass, fail)
```

---

## 10. học phí

```sql
payments
- payment_id (PK)
- student_id (FK -> students.student_id)
- class_id (FK -> classes.class_id)
- amount
- payment_date
- payment_method
- status (paid, unpaid, pending)
```

---

## 11. giảm giá

```sql
discounts
- discount_id (PK)
- discount_name
- discount_percent
- description
- active
```

---

## 12. học phí áp giảm giá

```sql
payment_discounts
- id (PK)
- payment_id (FK -> payments.payment_id)
- discount_id (FK -> discounts.discount_id)
```

---

# quan hệ giữa các bảng

- 1 User → 1 Student / Teacher  
- 1 Course → N Classes  
- 1 Teacher → N Classes  
- Student ↔ Class → N-N (qua Enrollments)  
- 1 Class → N Schedules  
- Schedule ↔ Student → Attendance  
- Student + Class → Grades  
- Student + Class → Payments  
- Payment ↔ Discount → N-N  

---

# Thứ tự tạo bảng
```text
users
 ├── students
 ├── teachers
 └── courses
       └── classes
            ├── schedules
            │     └── attendance
            ├── enrollments
            ├── grades
            └── payments
                  └── payment_discounts

discounts
 └── payment_discounts
 ```