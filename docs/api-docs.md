## 1. API dành cho Student

| Chức năng                         | Method | Endpoint                           | Ghi chú                                                           | Trạng thái |
| --------------------------------- | ------ | ---------------------------------- | ----------------------------------------------------------------- | ---------- |
| Đăng nhập                         | POST   | /api/auth/login                    | Đăng nhập chung cho tất cả user                                   | Đã làm     |
| Thông tin cá nhân                 | GET    | /api/me/profile                    | Thông tin user hiện tại                                           | Đã làm     |
| Xem khóa học                      | GET    | /api/courses                       | Mặc định chỉ trả khóa học có lớp đang mở đăng ký (`visible=true`) | Đã làm     |
| Xem ds lớp thuộc khóa học         | GET    | /api/courses/{courseId}/classes    | Mặc định chỉ trả lớp đang mở đăng ký                              | Đã làm     |
| Xem lớp của tôi                   | GET    | /api/me/classes                    | Lấy lớp học viên đã đăng ký                                       | Đã làm     |
| Đăng kí lớp học                   | POST   | /api/enrollments                   | Đăng ký học một lớp                                               | Đã làm     |
| Lịch học của tôi                  | GET    | /api/me/schedules                  | Lịch học của học viên hiện tại                                    | Đã làm     |
| Xem bảng điểm                     | GET    | /api/me/grades                     | Bảng điểm của học viên hiện tại                                   | Đã làm     |
| Học phí và lịch sử                | GET    | /api/me/payments                   | Lịch sử thanh toán của user hiện tại                              | Đã làm     |
| Chi tiết thanh toán theo học viên | GET    | /api/students/{studentId}/payments | Xem hóa đơn của một học viên theo ID                              | Đã làm     |
| Thanh toán                        | POST   | /api/payments                      | Tạo yêu cầu hoặc đơn thanh toán mới                               | Đã làm     |
| Xác nhận thanh toán               | POST   | /api/payments/{id}/payed           | Đánh dấu payment đã thanh toán                                    | Đã làm     |

## 2. API dành cho Teacher

| Chức năng               | Method | Endpoint                               | Ghi chú                         | Trạng thái |
| ----------------------- | ------ | -------------------------------------- | ------------------------------- | ---------- |
| Đăng nhập               | POST   | /api/auth/login                        | Dùng chung cho tất cả user      | Đã làm     |
| Thông tin cá nhân       | GET    | /api/me/profile                        | Thông tin teacher hiện tại      | Đã làm     |
| Xem lớp đang dạy        | GET    | /api/me/classes                        | Lấy lớp teacher được phân công  | Đã làm     |
| Xem lịch dạy            | GET    | /api/me/schedules                      | Lịch dạy của teacher hiện tại   | Đã làm     |
| Lấy lớp theo teacher    | GET    | /api/teachers/{teacherId}/classes      | Danh sách lớp theo teacher ID   | Đã làm     |
| Học viên trong lớp      | GET    | /api/classes/{classId}/students        | Danh sách học viên trong lớp    | Đã làm     |
| Thực hiện điểm danh     | POST   | /api/attendances                       | Tạo attendance cho một buổi học | Đã làm     |
| Cập nhật điểm danh      | PUT    | /api/attendances/{id}                  | Sửa attendance đã ghi           | Đã làm     |
| Xem danh sách điểm danh | GET    | /api/attendances/schedule/{scheduleId} | Lấy attendance theo buổi học    | Đã làm     |
| Nhập điểm               | POST   | /api/grades                            | Tạo grade mới cho học viên      | Đã làm     |
| Sửa điểm                | PUT    | /api/grades/{id}                       | Cập nhật grade đã tạo           | Đã làm     |
| Xem điểm theo lớp       | GET    | /api/grades/class/{classId}            | Xem bảng điểm của lớp           | Đã làm     |

## 3. API dành cho Admin

| Chức năng          | Method | Endpoint                       | Ghi chú                                                                      | Trạng thái |
| ------------------ | ------ | ------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| Đăng nhập          | POST   | /api/auth/login                | Dùng chung cho tất cả user                                                   | Đã làm     |
| Quản lý user       | GET    | /api/users                     | Danh sách user toàn hệ thống                                                 | Đã làm     |
| Quản lý user       | POST   | /api/users                     | Tạo user mới (admin)                                                         | Đã làm     |
| Quản lý user       | PUT    | /api/users/{userId}            | Cập nhật thông tin user                                                      | Đã làm     |
| Khóa user          | PUT    | /api/users/{userId}/deactivate | Tạm khóa user                                                                | Đã làm     |
| Quản lý student    | GET    | /api/students                  | Danh sách học viên                                                           | Đã làm     |
| Quản lý student    | GET    | /api/students/{id}             | Chi tiết học viên                                                            | Đã làm     |
| Quản lý student    | PUT    | /api/students/{id}             | Cập nhật học viên                                                            | Đã làm     |
| Quản lý teacher    | GET    | /api/teachers                  | Danh sách giáo viên                                                          | Đã làm     |
| Quản lý teacher    | GET    | /api/teachers/{id}             | Chi tiết giáo viên                                                           | Đã làm     |
| Quản lý teacher    | POST   | /api/teachers                  | Tạo giáo viên                                                                | Đã làm     |
| Quản lý teacher    | PUT    | /api/teachers/{id}             | Cập nhật giáo viên                                                           | Đã làm     |
| Quản lý teacher    | DELETE | /api/teachers/{id}             | Xóa giáo viên                                                                | Đã làm     |
| Quản lý khóa học   | GET    | /api/courses                   | `visible=false` để xem toàn bộ khóa học, kể cả chưa có lớp mở                | Đã làm     |
| Quản lý khóa học   | POST   | /api/courses                   | Tạo khóa học                                                                 | Đã làm     |
| Quản lý khóa học   | PUT    | /api/courses/{courseId}        | Cập nhật khóa học                                                            | Đã làm     |
| Quản lý lớp học    | GET    | /api/classes                   | Danh sách lớp                                                                | Đã làm     |
| Quản lý lớp học    | GET    | /api/classes/{id}              | Chi tiết lớp                                                                 | Đã làm     |
| Quản lý lớp học    | POST   | /api/classes                   | Tạo lớp                                                                      | Đã làm     |
| Quản lý lớp học    | PUT    | /api/classes/{id}              | Cập nhật lớp                                                                 | Đã làm     |
| Quản lý lớp học    | DELETE | /api/classes/{id}              | Xóa lớp                                                                      | Đã làm     |
| Ghi chú lớp học    | -      | -                              | Lớp nên có `registrationStart` và `registrationEnd` để hiển thị cho học viên | Đã làm     |
| Quản lý giảm giá   | GET    | /api/discounts                 | Danh sách giảm giá                                                           | Đã làm     |
| Quản lý giảm giá   | POST   | /api/discounts                 | Tạo giảm giá                                                                 | Đã làm     |
| Quản lý giảm giá   | PUT    | /api/discounts/{id}            | Cập nhật giảm giá                                                            | Đã làm     |
| Quản lý giảm giá   | DELETE | /api/discounts/{id}            | Xóa giảm giá                                                                 | Đã làm     |
| Xếp lịch học       | GET    | /api/schedules/{id}            | Chi tiết lịch học                                                            | Đã làm     |
| Xếp lịch học       | GET    | /api/schedules/class/{classId} | Danh sách lịch theo lớp                                                      | Đã làm     |
| Xếp lịch học       | POST   | /api/schedules                 | Tạo lịch học                                                                 | Đã làm     |
| Xếp lịch học       | PUT    | /api/schedules/{id}            | Cập nhật lịch học                                                            | Đã làm     |
| Xếp lịch học       | DELETE | /api/schedules/{id}            | Xóa lịch học                                                                 | Đã làm     |
| Quản lý enrollment | GET    | /api/enrollments               | Danh sách đăng ký                                                            | Đã làm     |
| Quản lý enrollment | PUT    | /api/enrollments/{id}          | Cập nhật enrollment                                                          | Đã làm     |

## 4. API chung

| Chức năng              | Method | Endpoint           | Ghi chú                       | Trạng thái |
| ---------------------- | ------ | ------------------ | ----------------------------- | ---------- |
| Đăng nhập              | POST   | /api/auth/login    | Sinh token hoặc session       | Đã làm     |
| Đăng ký                | POST   | /api/auth/register | Tạo account mới nếu cần       | Đã làm     |
| Logout                 | POST   | /api/auth/logout   | Đăng xuất hoặc invalid token  | Đã làm     |
| Thông tin hiện tại     | GET    | /api/me/profile    | Dùng cho tất cả role          | Đã làm     |
| Xem lớp của tôi        | GET    | /api/me/classes    | Trả dữ liệu theo role         | Đã làm     |
| Xem lịch của tôi       | GET    | /api/me/schedules  | Trả lịch theo role            | Đã làm     |
| Xem thanh toán của tôi | GET    | /api/me/payments   | Trả dữ liệu theo role/student | Đã làm     |
| Xem bảng điểm của tôi  | GET    | /api/me/grades     | Dành cho student hiện tại     | Đã làm     |
