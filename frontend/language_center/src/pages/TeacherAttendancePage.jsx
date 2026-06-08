import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../service/apiClient";

const formatDate = (value, options = {}) => {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(new Date(`${value}T00:00:00`));
};

const formatTime = (value) => (value ? value.slice(0, 5) : "--:--");

const getUpcomingSchedule = (items) => {
  const now = new Date();
  return (
    items.find(
      (item) => new Date(`${item.lessonDate}T${item.startTime}`) >= now,
    ) ||
    items[0] ||
    null
  );
};

const STATUS_OPTIONS = [
  {
    value: "PRESENT",
    label: "Có mặt",
    className: "present",
    icon: "ph-check-circle",
  },
  { value: "LATE", label: "Đi trễ", className: "late", icon: "ph-clock" },
  { value: "ABSENT", label: "Vắng", className: "absent", icon: "ph-x-circle" },
];

export default function TeacherAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [message, setMessage] = useState("");
  const [savingStudentId, setSavingStudentId] = useState(null);

  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      setError("");

      const [classResult, scheduleResult] = await Promise.allSettled([
        apiClient.get("/me/classes"),
        apiClient.get("/me/schedules"),
      ]);

      if (classResult.status === "fulfilled") {
        const nextClasses = classResult.value.data || [];
        setClasses(nextClasses);
        if (nextClasses.length > 0) {
          setSelectedClassId(String(nextClasses[0].classId));
        }
      }

      if (scheduleResult.status === "fulfilled") {
        setSchedules(scheduleResult.value.data || []);
      }

      if (
        classResult.status === "rejected" &&
        scheduleResult.status === "rejected"
      ) {
        setError("Không thể tải dữ liệu điểm danh lúc này.");
      }

      setLoading(false);
    };

    fetchBaseData();
  }, []);

  const selectedClassSchedules = useMemo(() => {
    return schedules
      .filter((item) => String(item.classId) === String(selectedClassId))
      .sort(
        (left, right) =>
          new Date(`${left.lessonDate}T${left.startTime}`) -
          new Date(`${right.lessonDate}T${right.startTime}`),
      );
  }, [schedules, selectedClassId]);

  useEffect(() => {
    if (!selectedClassId) return;

    const currentScheduleStillValid = selectedClassSchedules.some(
      (item) => String(item.scheduleId) === String(selectedScheduleId),
    );

    if (!currentScheduleStillValid) {
      const nextSchedule = getUpcomingSchedule(selectedClassSchedules);
      setSelectedScheduleId(
        nextSchedule ? String(nextSchedule.scheduleId) : "",
      );
    }
  }, [selectedClassId, selectedClassSchedules, selectedScheduleId]);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await apiClient.get(
          `/classes/${selectedClassId}/students`,
        );
        setStudents(response.data || []);
      } catch (fetchError) {
        console.error("Lỗi tải danh sách học viên:", fetchError);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [selectedClassId]);

  useEffect(() => {
    if (!selectedScheduleId) {
      setAttendanceMap({});
      return;
    }

    const fetchAttendance = async () => {
      try {
        const response = await apiClient.get(
          `/attendances/schedule/${selectedScheduleId}`,
        );
        const nextMap = (response.data || []).reduce((accumulator, item) => {
          accumulator[item.studentId] = item;
          return accumulator;
        }, {});
        setAttendanceMap(nextMap);
      } catch (fetchError) {
        console.error("Lỗi tải điểm danh:", fetchError);
        setAttendanceMap({});
      }
    };

    fetchAttendance();
  }, [selectedScheduleId]);

  const selectedClass = classes.find(
    (item) => String(item.classId) === String(selectedClassId),
  );
  const selectedSchedule = selectedClassSchedules.find(
    (item) => String(item.scheduleId) === String(selectedScheduleId),
  );

  const summary = useMemo(() => {
    const statuses = Object.values(attendanceMap).map((item) => item.status);
    return {
      present: statuses.filter((value) => value === "PRESENT").length,
      late: statuses.filter((value) => value === "LATE").length,
      absent: statuses.filter((value) => value === "ABSENT").length,
    };
  }, [attendanceMap]);

  const checkedCount = summary.present + summary.late + summary.absent;

  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedScheduleId) return;

    setSavingStudentId(studentId);
    setMessage("");

    try {
      const existingAttendance = attendanceMap[studentId];
      let response;

      if (existingAttendance?.attendanceId) {
        response = await apiClient.put(
          `/attendances/${existingAttendance.attendanceId}`,
          {
            studentId,
            scheduleId: Number(selectedScheduleId),
            status,
          },
        );
      } else {
        response = await apiClient.post("/attendances", {
          studentId,
          scheduleId: Number(selectedScheduleId),
          status,
        });
      }

      setAttendanceMap((currentMap) => ({
        ...currentMap,
        [studentId]: response.data,
      }));
      setMessage("Đã cập nhật điểm danh cho buổi học đang chọn.");
    } catch (saveError) {
      console.error("Lỗi cập nhật điểm danh:", saveError);
      setMessage("Không thể lưu điểm danh cho học viên này.");
    } finally {
      setSavingStudentId(null);
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải không gian điểm danh...
      </div>
    );
  }

  if (error) {
    return <div className="student-dashboard-loading error">{error}</div>;
  }

  return (
    <div className="student-dashboard teacher-workspace">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Điểm danh lớp học</span>
          <h1>Kiểm tra sĩ số và lưu trạng thái học viên theo từng buổi dạy</h1>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            {selectedSchedule ? "Buổi đang thao tác" : "Chọn lớp để bắt đầu"}
          </div>
          <h3>{selectedClass?.className || "Chưa có lớp được phân công"}</h3>
          <p>
            {selectedSchedule
              ? `${formatDate(selectedSchedule.lessonDate, { weekday: "long" })} • ${formatTime(selectedSchedule.startTime)} - ${formatTime(selectedSchedule.endTime)}`
              : ""}
          </p>

          <div className="highlight-meta-grid">
            <div>
              <span>Khóa học</span>
              <strong>
                {selectedClass?.course?.courseName ||
                  selectedClass?.course?.name ||
                  "Đang cập nhật"}
              </strong>
            </div>
            <div>
              <span>Sĩ số lớp</span>
              <strong>{students.length} học viên</strong>
            </div>
            <div>
              <span>Phòng học</span>
              <strong>{selectedSchedule?.roomNumber || "Chưa có"}</strong>
            </div>
            <div>
              <span>Tiến độ buổi này</span>
              <strong>
                {students.length > 0
                  ? `${checkedCount}/${students.length} đã điểm danh`
                  : "Chưa có dữ liệu"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon teal">
            <i className="ph ph-check-circle"></i>
          </div>
          <div>
            <strong>{summary.present}</strong>
            <span>Có mặt</span>
            <small>Học viên đã vào lớp đúng hoặc đủ giờ</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-clock"></i>
          </div>
          <div>
            <strong>{summary.late}</strong>
            <span>Đi trễ</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-x-circle"></i>
          </div>
          <div>
            <strong>{summary.absent}</strong>
            <span>Vắng mặt</span>
            <small>Dữ liệu này sẽ đi vào báo cáo buổi học</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-users-three"></i>
          </div>
          <div>
            <strong>{classes.length}</strong>
            <span>Lớp phụ trách</span>
            <small>Chuyển lớp ở bộ lọc bên dưới để thao tác nhanh</small>
          </div>
        </article>
      </section>

      <section className="teacher-tool-grid">
        <div className="dashboard-surface">
          <div className="surface-header">
            <div>
              <h2>Bộ lọc buổi học</h2>
            </div>
          </div>

          <div className="teacher-filter-grid">
            <label className="teacher-field">
              <span>Lớp học</span>
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
              >
                {classes.length === 0 && (
                  <option value="">Chưa có lớp nào</option>
                )}
                {classes.map((item) => (
                  <option key={item.classId} value={item.classId}>
                    {item.className} •{" "}
                    {item.course?.courseName || item.course?.name || "Khóa học"}
                  </option>
                ))}
              </select>
            </label>

            <label className="teacher-field">
              <span>Buổi học</span>
              <select
                value={selectedScheduleId}
                onChange={(event) => setSelectedScheduleId(event.target.value)}
              >
                {selectedClassSchedules.length === 0 && (
                  <option value="">Chưa có lịch cho lớp này</option>
                )}
                {selectedClassSchedules.map((item) => (
                  <option key={item.scheduleId} value={item.scheduleId}>
                    {formatDate(item.lessonDate)} • {formatTime(item.startTime)}{" "}
                    - {formatTime(item.endTime)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message && <div className="teacher-inline-message">{message}</div>}

          <div className="attendance-list">
            {students.length > 0 ? (
              students.map((student) => {
                const currentStatus = attendanceMap[student.id]?.status;

                return (
                  <article key={student.id} className="attendance-row-card">
                    <div className="attendance-student-copy">
                      <div className="attendance-avatar">
                        {(student.fullName || "H")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <strong>
                          {student.fullName || `Học viên #${student.id}`}
                        </strong>
                        <span>
                          {student.email ||
                            student.username ||
                            `Mã học viên ${student.id}`}
                        </span>
                      </div>
                    </div>

                    <div className="attendance-actions">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`attendance-status-btn ${option.className} ${currentStatus === option.value ? "active" : ""}`}
                          onClick={() =>
                            handleMarkAttendance(student.id, option.value)
                          }
                          disabled={savingStudentId === student.id}
                        >
                          <i className={`ph ${option.icon}`}></i>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                Lớp này hiện chưa có học viên hoặc bạn chưa được phân buổi dạy
                tương ứng.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
