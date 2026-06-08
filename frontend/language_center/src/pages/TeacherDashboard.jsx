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

const normalizeDateInput = (value) => {
  if (!value) return null;
  if (typeof value !== "string") return null;
  if (value.includes("T")) return value.split("T")[0];
  if (value.includes(" ")) return value.split(" ")[0];
  return value;
};

const formatDateLabel = (value, options = {}) => {
  if (!value) return "Chưa cập nhật";
  const normalizedValue = normalizeDateInput(value);
  if (!normalizedValue) return "Chưa cập nhật";

  const parsedDate = new Date(`${normalizedValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(parsedDate);
};

const formatTime = (value) => (value ? value.slice(0, 5) : "--:--");

const getClassStatusLabel = (status) => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "ACTIVE") return "Đang diễn ra";
  if (normalized === "COMPLETED") return "Đã kết thúc";
  return status || "Đang xử lý";
};

const getScheduleTone = (startTime) => {
  if (!startTime) return "teal";
  if (startTime < "12:00:00") return "amber"; // Sáng
  if (startTime < "18:00:00") return "teal"; // Chiều
  return "navy"; // Tối
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [profile, setProfile] = useState({
    fullName: "Đang tải...",
    email: "",
  });
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        // Lấy thông tin user hiện tại
        const profileRes = await apiClient.get("/me/profile");
        const userData = profileRes.data;
        setProfile(userData);
        setTeacherInfo(userData.teacherInfo || null);

        // Giả định backend có trả về teacherId trong profile, hoặc gọi API lấy teacher info
        // Nếu API /me/profile đã bao gồm teacherInfo: setTeacherInfo(userData.teacherInfo);
        // Tạm thời gọi API lấy lịch dạy và lớp học (Sử dụng endpoint /me/schedules và /me/classes dành cho giáo viên)
        const [classResult, scheduleResult] = await Promise.allSettled([
          apiClient.get("/me/classes"), // Hoặc apiClient.get(`/api/teachers/${teacherId}/classes`)
          apiClient.get("/me/schedules"),
        ]);

        if (classResult.status === "fulfilled")
          setClasses(classResult.value.data || []);
        if (scheduleResult.status === "fulfilled")
          setSchedules(scheduleResult.value.data || []);
      } catch (error) {
        console.error("Lỗi tải dashboard giáo viên:", error);
        setLoadError(
          "Không thể tải dữ liệu dashboard lúc này. Vui lòng thử lại sau.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  // Map thông tin lớp để truy xuất nhanh
  const classMap = useMemo(
    () =>
      classes.reduce((acc, item) => {
        acc[item.classId || item.id] = item;
        return acc;
      }, {}),
    [classes],
  );

  // Xử lý dữ liệu lịch dạy
  const scheduleItems = useMemo(() => {
    return schedules
      .map((item) => {
        const classInfo = classMap[item.classId];
        const lessonDate = normalizeDateInput(item.lessonDate);
        const startAt =
          lessonDate && item.startTime
            ? new Date(`${lessonDate}T${item.startTime}`)
            : null;

        return {
          ...item,
          lessonDate,
          className: classInfo?.className || `Lớp #${item.classId}`,
          courseName:
            classInfo?.course?.courseName ||
            classInfo?.course?.name ||
            classInfo?.courseName ||
            "Khóa học",
          eventTone: getScheduleTone(item.startTime),
          startAt,
        };
      })
      .filter(
        (item) =>
          item.lessonDate &&
          item.startAt &&
          !Number.isNaN(item.startAt.getTime()),
      )
      .sort((a, b) => a.startAt - b.startAt);
  }, [classMap, schedules]);

  const currentDateKey = getTodayKey();
  const referenceNow = useMemo(() => new Date(), []);
  const upcomingSchedules = scheduleItems.filter(
    (item) => item.startAt >= referenceNow,
  );
  const nextSchedule = upcomingSchedules[0] || scheduleItems[0] || null;

  useEffect(() => {
    if (!selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDate(nextSchedule ? nextSchedule.lessonDate : currentDateKey);
    }
  }, [nextSchedule, currentDateKey, selectedDate]);

  const selectedDaySchedules = useMemo(() => {
    return scheduleItems.filter((item) => item.lessonDate === selectedDate);
  }, [scheduleItems, selectedDate]);

  // Dữ liệu cho FullCalendar
  const calendarEvents = scheduleItems.map((item) => ({
    id: String(
      item.scheduleId ??
        item.id ??
        `${item.classId}-${item.lessonDate}-${item.startTime}`,
    ),
    title: `${formatTime(item.startTime)} - ${item.className}`,
    start: `${item.lessonDate}T${item.startTime}`,
    end: `${item.lessonDate}T${item.endTime}`,
    classNames: ["dashboard-calendar-event", `tone-${item.eventTone}`],
  }));

  // Tính toán thống kê
  const totalStudents = classes.reduce(
    (sum, cls) => sum + (Number(cls.enrolledStudents) || 0),
    0,
  );
  const classesThisMonth = scheduleItems.filter((s) =>
    s.lessonDate?.startsWith(currentDateKey.slice(0, 7)),
  ).length;

  if (loading)
    return (
      <div className="student-dashboard-loading">
        Đang tải không gian làm việc...
      </div>
    );
  if (loadError)
    return <div className="student-dashboard-loading error">{loadError}</div>;

  return (
    <div className="student-dashboard teacher-dashboard">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Không gian Giảng viên</span>
          <h1>
            Chào thầy/cô {profile.fullName}, chúc một ngày làm việc hiệu quả!
          </h1>

          <div className="hero-pill-row">
            <button
              type="button"
              className="hero-pill-btn"
              onClick={() => navigate("/teacher/grades")}
            >
              <i className="ph ph-exam"></i>
              Nhập điểm học viên
            </button>
            <button
              type="button"
              className="hero-pill-btn secondary"
              onClick={() => navigate("/teacher/attendance")}
            >
              <i className="ph ph-check-square-offset"></i>
              Điểm danh
            </button>
          </div>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            {nextSchedule ? "Lớp dạy tiếp theo" : "Chưa có lịch dạy sắp tới"}
          </div>
          <h3>{nextSchedule?.courseName || "Hôm nay không có tiết"}</h3>
          <p>
            {nextSchedule
              ? `${nextSchedule.className} • ${formatDateLabel(nextSchedule.lessonDate, { weekday: "long" })}`
              : "Hãy dành thời gian nghỉ ngơi hoặc chuẩn bị giáo án cho các tuần tới."}
          </p>

          <div className="highlight-meta-grid">
            <div>
              <span>Khung giờ</span>
              <strong>
                {nextSchedule
                  ? `${formatTime(nextSchedule.startTime)} - ${formatTime(nextSchedule.endTime)}`
                  : "--"}
              </strong>
            </div>
            <div>
              <span>Phòng học</span>
              <strong>{nextSchedule?.roomNumber || "--"}</strong>
            </div>
            <div>
              <span>Email liên hệ</span>
              <strong>{profile.email}</strong>
            </div>
            <div>
              <span>Chuyên môn</span>
              <strong>{teacherInfo?.specialization || "Đang cập nhật"}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Thống kê nhanh */}
      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon teal">
            <i className="ph ph-chalkboard-teacher"></i>
          </div>
          <div>
            <strong>{classes.length}</strong>
            <span>Lớp đang phụ trách</span>
            <small>Các lớp có trạng thái hoạt động</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-users-three"></i>
          </div>
          <div>
            <strong>{totalStudents}</strong>
            <span>Tổng học viên</span>
            <small>Đang theo học trong các lớp của bạn</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-calendar-star"></i>
          </div>
          <div>
            <strong>{classesThisMonth}</strong>
            <span>Tiết dạy tháng này</span>
          </div>
        </article>
      </section>

      <section className="student-dashboard-grid">
        {/* Cột lịch dạy */}
        <div className="dashboard-surface schedule-surface">
          <div className="surface-header">
            <div>
              <h2>Lịch giảng dạy</h2>
              <p>
                Ngày đang xem:{" "}
                {formatDateLabel(selectedDate, { weekday: "long" })}
              </p>
            </div>
            <span className="surface-badge">
              {selectedDaySchedules.length > 0
                ? `${selectedDaySchedules.length} ca dạy`
                : "Trống lịch"}
            </span>
          </div>

          <div className="schedule-focus-grid">
            {selectedDaySchedules.length > 0 ? (
              selectedDaySchedules.map((item) => (
                <article
                  key={
                    item.scheduleId ??
                    item.id ??
                    `${item.classId}-${item.lessonDate}-${item.startTime}`
                  }
                  className={`schedule-focus-card tone-${item.eventTone}`}
                >
                  <div className="schedule-card-topline">
                    <span>Phòng {item.roomNumber}</span>
                    <strong>
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </strong>
                  </div>
                  <h3>{item.className}</h3>
                  <p>{item.courseName}</p>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">
                Bạn không có ca dạy nào vào ngày {formatDateLabel(selectedDate)}
                .
              </div>
            )}
          </div>

          <div className="dashboard-calendar-shell">
            <FullCalendar
              key="teacher-calendar"
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={selectedDate || currentDateKey}
              locale="vi"
              height="auto"
              dayMaxEvents={3}
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

        {/* Cột danh sách lớp học */}
        <div className="dashboard-side-column">
          <div className="dashboard-surface side-surface">
            <div className="surface-header">
              <div>
                <h2>Lớp học phụ trách</h2>
                <p>Danh sách các lớp bạn đang trực tiếp đứng lớp.</p>
              </div>
            </div>

            <div className="course-compact-list">
              {classes.length > 0 ? (
                classes.map((item, index) => (
                  <article
                    key={
                      item.classId ?? item.id ?? `${item.className}-${index}`
                    }
                    className="course-compact-card"
                  >
                    <div className="course-card-header">
                      <span className="course-status-pill">
                        {getClassStatusLabel(item.status)}
                      </span>
                      <strong>{item.className}</strong>
                    </div>
                    <h3>
                      {item.course?.name || item.courseName || "Khóa học"}
                    </h3>
                    <div className="course-card-meta">
                      <span>
                        <i className="ph ph-users"></i> {item.enrolledStudents}/
                        {item.maxStudents} HV
                      </span>
                      <span>Từ {formatDateLabel(item.startDate)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Hiện chưa có lớp học nào được gán cho bạn.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
