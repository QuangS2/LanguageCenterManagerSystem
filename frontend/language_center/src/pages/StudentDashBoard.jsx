import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../service/apiClient";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDateTimeInput = (value) => {
  if (!value) {
    return null;
  }

  return value.includes("T") ? value : value.replace(" ", "T");
};

const formatDateLabel = (value, options = {}) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(new Date(`${value}T00:00:00`));
};

const formatDateTimeLabel = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(normalizeDateTimeInput(value)));
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");
const formatTime = (value) => (value ? value.slice(0, 5) : "--:--");
const normalizeStatus = (value) => (value || "").toUpperCase();

const getPaymentStatusLabel = (status) => {
  if (normalizeStatus(status) === "PAID") return "Đã thanh toán";
  if (normalizeStatus(status) === "PENDING") return "Chờ thanh toán";
  return "Chưa rõ trạng thái";
};

const getClassStatusLabel = (status) => {
  if (normalizeStatus(status) === "ACTIVE") return "Đang học";
  if (normalizeStatus(status) === "COMPLETED") return "Đã kết thúc";
  return status || "Đang xử lý";
};

const getGradeResultLabel = (result) => {
  if (normalizeStatus(result) === "PASS") return "Đạt";
  if (normalizeStatus(result) === "FAIL") return "Cần cải thiện";
  return result || "Đang cập nhật";
};

const getScheduleTone = (startTime) => {
  if (!startTime) return "teal";
  if (startTime < "12:00:00") return "amber";
  if (startTime < "18:00:00") return "teal";
  return "navy";
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "Đang tải...",
    email: "",
    studentInfo: null,
  });
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadError("");

      const [
        profileResult,
        scheduleResult,
        classResult,
        gradeResult,
        paymentResult,
      ] = await Promise.allSettled([
        apiClient.get("/me/profile"),
        apiClient.get("/me/schedules"),
        apiClient.get("/me/classes"),
        apiClient.get("/me/grades"),
        apiClient.get("/me/payments"),
      ]);

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data);
      }

      if (scheduleResult.status === "fulfilled") {
        setSchedules(scheduleResult.value.data || []);
      }

      if (classResult.status === "fulfilled") {
        setClasses(classResult.value.data || []);
      }

      if (gradeResult.status === "fulfilled") {
        setGrades(gradeResult.value.data || []);
      }

      if (paymentResult.status === "fulfilled") {
        setPayments(paymentResult.value.data || []);
      }

      const failedCalls = [
        profileResult,
        scheduleResult,
        classResult,
        gradeResult,
        paymentResult,
      ].filter((result) => result.status === "rejected");

      if (failedCalls.length === 5) {
        setLoadError("Không thể tải dữ liệu dashboard vào lúc này.");
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const classMap = useMemo(
    () =>
      classes.reduce((accumulator, item) => {
        accumulator[item.classId] = item;
        return accumulator;
      }, {}),
    [classes],
  );

  const scheduleItems = useMemo(() => {
    return schedules
      .map((item) => {
        const classInfo = classMap[item.classId];
        const startAt = new Date(`${item.lessonDate}T${item.startTime}`);

        return {
          ...item,
          className: classInfo?.className || `Lớp #${item.classId}`,
          courseName:
            classInfo?.course?.courseName ||
            classInfo?.course?.name ||
            "Khóa học đang cập nhật",
          teacherName:
            classInfo?.teacher?.teacherName ||
            classInfo?.teacher?.user?.fullname ||
            "Chưa gán giáo viên",
          eventTone: getScheduleTone(item.startTime),
          startAt,
        };
      })
      .sort((left, right) => left.startAt - right.startAt);
  }, [classMap, schedules]);

  const currentDateKey = getTodayKey();
  const referenceNow = useMemo(() => new Date(), []);
  const upcomingSchedules = scheduleItems.filter(
    (item) => item.startAt >= referenceNow,
  );
  const referenceSchedule =
    upcomingSchedules[0] || scheduleItems[scheduleItems.length - 1] || null;
  const referenceDate = referenceSchedule?.lessonDate || currentDateKey;
  const effectiveSelectedDate = selectedDate || referenceDate;

  const selectedDaySchedules = scheduleItems.filter(
    (item) => item.lessonDate === effectiveSelectedDate,
  );

  const recentOrUpcomingSchedules =
    upcomingSchedules.length > 0
      ? upcomingSchedules.slice(0, 4)
      : [...scheduleItems].slice(-4).reverse();

  const gradeRows = useMemo(() => {
    return grades.map((item) => {
      const classInfo = classMap[item.classId];
      return {
        ...item,
        className: classInfo?.className || `Lớp #${item.classId}`,
        courseName:
          classInfo?.course?.courseName ||
          classInfo?.course?.name ||
          "Khóa học đang cập nhật",
        teacherName:
          classInfo?.teacher?.teacherName ||
          classInfo?.teacher?.user?.fullname ||
          "Chưa gán giáo viên",
      };
    });
  }, [classMap, grades]);

  const courseRows = useMemo(() => {
    return classes.map((item) => {
      const classSchedules = scheduleItems.filter(
        (schedule) => schedule.classId === item.classId,
      );
      const classGrade = gradeRows.find(
        (grade) => grade.classId === item.classId,
      );

      return {
        ...item,
        totalLessons: classSchedules.length,
        nextLesson:
          classSchedules.find((schedule) => schedule.startAt >= referenceNow) ||
          classSchedules[classSchedules.length - 1] ||
          null,
        finalGrade: classGrade?.finalGrade,
        midtermGrade: classGrade?.midtermGrade,
      };
    });
  }, [classes, gradeRows, referenceNow, scheduleItems]);

  const pendingPayments = payments.filter(
    (item) => normalizeStatus(item.status) === "PENDING",
  );
  const averageFinalGrade =
    gradeRows.length > 0
      ? gradeRows.reduce(
          (total, item) =>
            total + Number(item.finalGrade || item.midtermGrade || 0),
          0,
        ) / gradeRows.length
      : 0;
  const totalPendingAmount = pendingPayments.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  );
  const currentMonthScheduleCount = scheduleItems.filter(
    (item) => item.lessonDate?.slice(0, 7) === referenceDate.slice(0, 7),
  ).length;
  const calendarEvents = scheduleItems.map((item) => ({
    id: String(item.scheduleId),
    title: item.courseName,
    start: `${item.lessonDate}T${item.startTime}`,
    end: `${item.lessonDate}T${item.endTime}`,
    classNames: ["dashboard-calendar-event", `tone-${item.eventTone}`],
  }));

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải dashboard học viên...
      </div>
    );
  }

  if (loadError) {
    return <div className="student-dashboard-loading">{loadError}</div>;
  }

  return (
    <div className="student-dashboard">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Dashboard học viên</span>
          <h1>
            {profile.fullName || "Học viên"} theo dõi lịch học và học phí trên
            một màn hình
          </h1>

          <div className="hero-pill-row">
            <button
              type="button"
              className="hero-pill-btn"
              onClick={() => navigate("/payments")}
            >
              <i className="ph ph-wallet"></i>
              Mở học phí
            </button>
            <button
              type="button"
              className="hero-pill-btn secondary"
              onClick={() => navigate("/courses")}
            >
              <i className="ph ph-graduation-cap"></i>
              Đăng ký thêm khóa học
            </button>
          </div>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            {upcomingSchedules.length > 0
              ? "Buổi học kế tiếp"
              : "Buổi học gần nhất"}
          </div>
          <h3>
            {referenceSchedule?.courseName || "Chưa có lịch học trong hệ thống"}
          </h3>
          <p>
            {referenceSchedule
              ? `${referenceSchedule.className} • ${formatDateLabel(referenceSchedule.lessonDate, { weekday: "long" })}`
              : ""}
          </p>

          <div className="highlight-meta-grid">
            <div>
              <span>Khung giờ</span>
              <strong>
                {referenceSchedule
                  ? `${formatTime(referenceSchedule.startTime)} - ${formatTime(referenceSchedule.endTime)}`
                  : "--"}
              </strong>
            </div>
            <div>
              <span>Phòng học</span>
              <strong>{referenceSchedule?.roomNumber || "Chưa có"}</strong>
            </div>
            <div>
              <span>Email nhận tin</span>
              <strong>{profile.email || "Chưa cập nhật"}</strong>
            </div>
            <div>
              <span>Điện thoại</span>
              <strong>{profile.studentInfo?.phone || "Chưa cập nhật"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon teal">
            <i className="ph ph-books"></i>
          </div>
          <div>
            <strong>{courseRows.length}</strong>
            <span>Khóa học đang theo</span>
            <small>
              {currentMonthScheduleCount} buổi học trong tháng đang xem
            </small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-calendar-check"></i>
          </div>
          <div>
            <strong>{scheduleItems.length}</strong>
            <span>Tổng buổi học đã lên lịch</span>
            <small>
              {selectedDaySchedules.length} buổi trong ngày đang chọn
            </small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-chart-line-up"></i>
          </div>
          <div>
            <strong>
              {averageFinalGrade ? averageFinalGrade.toFixed(1) : "--"}
            </strong>
            <span>Điểm trung bình hiện có</span>
            <small>{gradeRows.length} đầu điểm đã được cập nhật</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-receipt"></i>
          </div>
          <div>
            <strong>{pendingPayments.length}</strong>
            <span>Hóa đơn chờ thanh toán</span>
            <small>
              {formatCurrency(totalPendingAmount)} đ đang chờ xác nhận
            </small>
          </div>
        </article>
      </section>

      <section className="student-dashboard-grid">
        <div className="dashboard-surface schedule-surface">
          <div className="surface-header">
            <div>
              <h2>Lịch học đang xem</h2>
              <p>
                {formatDateLabel(effectiveSelectedDate, { weekday: "long" })}
              </p>
            </div>
            <span className="surface-badge">
              {selectedDaySchedules.length > 0
                ? `${selectedDaySchedules.length} buổi trong ngày`
                : "Chưa có buổi học"}
            </span>
          </div>

          <div className="schedule-focus-grid">
            {selectedDaySchedules.length > 0 ? (
              selectedDaySchedules.map((item) => (
                <article
                  key={item.scheduleId}
                  className={`schedule-focus-card tone-${item.eventTone}`}
                >
                  <div className="schedule-card-topline">
                    <span>{item.className}</span>
                    <strong>
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </strong>
                  </div>
                  <h3>{item.courseName}</h3>
                  <p>
                    {item.teacherName} • Phòng {item.roomNumber}
                  </p>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">
                Không có buổi học nào vào{" "}
                {formatDateLabel(effectiveSelectedDate)}.
              </div>
            )}
          </div>

          <div className="dashboard-calendar-shell">
            <FullCalendar
              key={referenceDate}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={referenceDate}
              locale="vi"
              height="auto"
              fixedWeekCount={false}
              dayMaxEvents={2}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              buttonText={{ today: "Hôm nay" }}
              events={calendarEvents}
              dateClick={(info) => setSelectedDate(info.dateStr)}
              eventClick={(info) =>
                setSelectedDate(info.event.startStr.slice(0, 10))
              }
            />
          </div>
        </div>

        <div className="dashboard-side-column">
          <div className="dashboard-surface side-surface">
            <div className="surface-header">
              <div>
                <h2>
                  {upcomingSchedules.length > 0
                    ? "Các buổi sắp tới"
                    : "Các buổi gần đây"}
                </h2>
              </div>
            </div>

            <div className="compact-list">
              {recentOrUpcomingSchedules.length > 0 ? (
                recentOrUpcomingSchedules.map((item) => (
                  <button
                    key={item.scheduleId}
                    type="button"
                    className="compact-list-item"
                    onClick={() => setSelectedDate(item.lessonDate)}
                  >
                    <div
                      className={`compact-marker tone-${item.eventTone}`}
                    ></div>
                    <div className="compact-item-copy">
                      <strong>{item.courseName}</strong>
                      <span>
                        {formatDateLabel(item.lessonDate)} •{" "}
                        {formatTime(item.startTime)} • Phòng {item.roomNumber}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Chưa có buổi học nào để hiển thị.
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-surface side-surface">
            <div className="surface-header">
              <div>
                <h2>Lớp đang học</h2>
                <p>
                  Tóm tắt các lớp bạn đang tham gia, kèm tên khóa học và buổi
                  học gần nhất.
                </p>
              </div>
            </div>

            <div className="course-compact-list">
              {courseRows.length > 0 ? (
                courseRows.map((item) => (
                  <article key={item.classId} className="course-compact-card">
                    <div className="course-card-header">
                      <span className="course-status-pill">
                        {getClassStatusLabel(item.status)}
                      </span>
                      <strong>{item.className}</strong>
                    </div>
                    <h3>
                      {item.course?.courseName ||
                        item.course?.name ||
                        "Khóa học đang cập nhật"}
                    </h3>
                    <p>
                      {item.teacher?.teacherName ||
                        item.teacher?.user?.fullname ||
                        "Chưa gán giáo viên"}
                    </p>
                    <div className="course-card-meta">
                      <span>{item.totalLessons} buổi đã xếp</span>
                      <span>
                        {item.nextLesson
                          ? formatDateLabel(item.nextLesson.lessonDate)
                          : "Chưa có lịch mới"}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Chưa có lớp đang học nào để hiển thị.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-detail-grid">
        <div className="dashboard-surface">
          <div className="surface-header">
            <div>
              <h2>Chi tiết điểm số</h2>
              <p>Theo dõi điểm giữa kỳ, cuối kỳ và nhận xét theo từng lớp.</p>
            </div>
          </div>

          <div className="grade-summary-row">
            <div className="grade-summary-tile">
              <span>Điểm TB cuối kỳ</span>
              <strong>
                {averageFinalGrade ? averageFinalGrade.toFixed(1) : "--"}
              </strong>
            </div>
            <div className="grade-summary-tile">
              <span>Môn đạt yêu cầu</span>
              <strong>
                {
                  gradeRows.filter(
                    (item) => normalizeStatus(item.result) === "PASS",
                  ).length
                }
              </strong>
            </div>
            <div className="grade-summary-tile">
              <span>Cần chú ý thêm</span>
              <strong>
                {
                  gradeRows.filter(
                    (item) => normalizeStatus(item.result) !== "PASS",
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="grade-card-grid">
            {gradeRows.length > 0 ? (
              gradeRows.map((item) => (
                <article key={item.gradeId} className="grade-detail-card">
                  <div className="grade-card-topline">
                    <span>{item.className}</span>
                    <strong>{getGradeResultLabel(item.result)}</strong>
                  </div>
                  <h3>{item.courseName}</h3>
                  <p>{item.teacherName}</p>
                  <div className="grade-value-row">
                    <div>
                      <span>Giữa kỳ</span>
                      <strong>{item.midtermGrade ?? "--"}</strong>
                    </div>
                    <div>
                      <span>Cuối kỳ</span>
                      <strong>{item.finalGrade ?? "--"}</strong>
                    </div>
                  </div>
                  <div className="grade-comment-box">
                    {item.comment || "Chưa có nhận xét từ giảng viên."}
                  </div>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">
                Điểm số chưa được cập nhật trong hệ thống.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-detail-stack">
          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Hóa đơn chờ thanh toán</h2>
                <p>Các khoản dưới đây cần bạn hoàn tất ở trang học phí.</p>
              </div>
              <button
                type="button"
                className="surface-link-btn"
                onClick={() => navigate("/payments")}
              >
                Mở học phí
              </button>
            </div>

            <div className="invoice-list">
              {pendingPayments.length > 0 ? (
                pendingPayments.map((item) => (
                  <article key={item.id} className="invoice-card pending">
                    <div className="invoice-card-topline">
                      <span>{getPaymentStatusLabel(item.status)}</span>
                      <strong>{formatCurrency(item.amount)} đ</strong>
                    </div>
                    <h3>{item.method || "Phương thức đang cập nhật"}</h3>
                    <p>Ngày tạo: {formatDateTimeLabel(item.date)}</p>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Hiện không có hóa đơn nào đang chờ thanh toán.
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Chi tiết lớp đang học</h2>
                <p>
                  Mỗi thẻ thể hiện tiến độ lớp, lịch gần nhất, giáo viên phụ
                  trách và khóa học đi kèm.
                </p>
              </div>
            </div>

            <div className="course-detail-grid">
              {courseRows.length > 0 ? (
                courseRows.map((item) => (
                  <article key={item.classId} className="course-detail-card">
                    <div className="course-detail-topline">
                      <span>{item.className}</span>
                      <strong>{getClassStatusLabel(item.status)}</strong>
                    </div>
                    <h3>
                      {item.course?.courseName ||
                        item.course?.name ||
                        "Khóa học đang cập nhật"}
                    </h3>
                    <p>
                      {item.description ||
                        "Chưa có mô tả chi tiết cho lớp này."}
                    </p>

                    <div className="course-detail-facts">
                      <div>
                        <span>Giảng viên</span>
                        <strong>
                          {item.teacher?.teacherName ||
                            item.teacher?.user?.fullname ||
                            "Chưa gán giáo viên"}
                        </strong>
                      </div>
                      <div>
                        <span>Thời gian lớp</span>
                        <strong>
                          {formatDateTimeLabel(item.startDate)} -{" "}
                          {formatDateTimeLabel(item.endDate)}
                        </strong>
                      </div>
                      <div>
                        <span>Sĩ số</span>
                        <strong>
                          {item.enrolledStudents}/{item.maxStudents} học viên
                        </strong>
                      </div>
                      <div>
                        <span>Buổi gần nhất</span>
                        <strong>
                          {item.nextLesson
                            ? `${formatDateLabel(item.nextLesson.lessonDate)} • ${formatTime(item.nextLesson.startTime)}`
                            : "Chưa có lịch mới"}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Chưa có chi tiết lớp nào để hiển thị.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
