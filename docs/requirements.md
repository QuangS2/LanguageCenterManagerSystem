# Phân tích yêu cầu

## 1. Quản lý học viên

- Học viên cần đăng ký khóa học.
- Học viên cần thanh toán học phí.
- Học viên cần xem thông tin cá nhân, lịch học, kết quả.

## 2. Quản lý khóa học / lớp học

- Cần tạo, sửa, xóa khóa học (Admin).
- Cần quản lý lớp học, phân công giáo viên.
- Giáo viên cần xem và quản lý lớp học mình phụ trách.

## 3. Quản lý kết quả học tập

- Giáo viên nhập điểm và nhận xét.
- Học viên xem điểm và kết quả.
- Admin theo dõi kết quả tổng thể.

## 4. Quản lý lịch học

- Admin cấu hình lịch học cho khóa học.
- Giáo viên xem và quản lý lịch dạy.
- Học viên xem lịch học và phòng học.

## 5. Quản lý học phí

- Admin cấu hình mức học phí, chính sách giảm giá.
- Học viên thanh toán học phí khi đăng ký.
- Hệ thống ghi nhận trạng thái thanh toán.

# Use case

## HỌC VIÊN

1. **Đăng ký khóa học và thanh toán học phí**
- Actor: Học viên
- Mô tả: Chọn khóa học, đăng ký, thực hiện thanh toán học phí.
- Kết quả: Khóa học được ghi nhận, học phí cập nhật.

2. **Xem lịch học và phòng học**
- Actor: Học viên
- Mô tả: Tra cứu lịch học, phòng học theo khóa học đã đăng ký.
- Kết quả: Biết thời gian, địa điểm học.

3. **Xem điểm và kết quả**
- Actor: Học viên
- Mô tả: Đăng nhập để xem điểm số, nhận xét, kết quả học tập.

## GIÁO VIÊN / TRỢ GIẢNG

1. **Quản lý lớp học và lịch dạy**
- Actor: Giáo viên
- Mô tả: Xem, chỉnh sửa lịch dạy, quản lý danh sách lớp.
- Kết quả: Lịch dạy được cập nhật, lớp học được quản lý.

2. **Điểm danh học viên**
- Actor: Giáo viên
- Mô tả: Thực hiện điểm danh trong buổi học.
- Kết quả: Lưu trạng thái tham gia của học viên.

3. **Nhập điểm và nhận xét**
- Actor: Giáo viên
- Mô tả: Nhập điểm, nhận xét cho học viên sau mỗi kỳ hoặc bài kiểm tra.
- Kết quả: Điểm và nhận xét được lưu vào hệ thống.

## ADMIN

1. **Quản lý chương trình/khóa học (CRUD)**
- Actor: Admin
- Mô tả: Tạo, sửa, xóa, cập nhật thông tin khóa học.
- Kết quả: Danh sách khóa học chính xác.

2. **Quản lý giáo viên và học viên**
- Actor: Admin
- Mô tả: Thêm, sửa, xóa thông tin giáo viên và học viên.
- Kết quả: Dữ liệu người dùng đầy đủ.

3. **Cấu hình học phí và chính sách**
- Actor: Admin
- Mô tả: Thiết lập mức học phí, chính sách giảm giá, quy định thanh toán.
- Kết quả: Học phí và chính sách được áp dụng cho học viên.

# Wireframes

## 1. Dashboard học viên
```text
├── Profile
│ └── Thông tin cá nhân
│
├── Courses
│ ├── Danh sách khóa học
│ │ └── Chi tiết khóa học
│ │ ├── Mô tả
│ │ ├── Lịch học
│ │ └── Đăng ký
│
├── My Classes
│ └── Danh sách lớp đã đăng ký
│ └── Chi tiết lớp
│ ├── Lịch học
│ ├── Giáo viên
│ └── Danh sách buổi học
│
├── Schedule
│ └── Calendar tuần/tháng
│
├── Grades
│ └── Bảng điểm theo lớp
│ ├── Quiz
│ ├── Midterm
│ └── Final
│
└── Payments
├── Học phí cần thanh toán
└── Lịch sử thanh toán
```
## 2. Dashboard giáo viên
```text
├── My Classes
│ └── Danh sách lớp
│ └── Chi tiết lớp
│ ├── Danh sách học viên
│ ├── Lịch học
│ ├── Điểm danh
│ └── Bảng điểm
│
├── Attendance
│ └── Chọn lớp
│ └── Chọn buổi học
│ └── Danh sách học viên
│ ├── Present
│ ├── Absent
│ └── Late
│
├── Grade Management
│ └── Chọn lớp
│ └── Bảng điểm
│ ├── Quiz
│ ├── Midterm
│ └── Final
│
└── Schedule
└── Lịch dạy
```
## 3. Dashboard Admin
```text
├── Course Management
│ ├── Danh sách khóa học
│ └── CRUD khóa học
│
├── Class Management
│ ├── Danh sách lớp
│ ├── Phân công giáo viên
│ └── Quản lý sĩ số
│
├── User Management
│ ├── Students
│ └── Teachers
│
├── Tuition Management
│ ├── Cấu hình học phí
│ └── Chính sách giảm giá























