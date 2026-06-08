import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../service/apiClient";

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Thứ 2" },
  { value: "2", label: "Thứ 3" },
  { value: "3", label: "Thứ 4" },
  { value: "4", label: "Thứ 5" },
  { value: "5", label: "Thứ 6" },
  { value: "6", label: "Thứ 7" },
  { value: "0", label: "Chủ nhật" },
];

const PERIOD_OPTIONS = [
  { value: "morning", label: "Buổi sáng" },
  { value: "afternoon", label: "Buổi chiều" },
];

const TIME_OPTIONS = {
  morning: ["07:00:00", "08:00:00", "09:00:00"],
  afternoon: ["13:00:00", "14:00:00", "15:00:00", "16:00:00"],
};

const DEFAULT_SESSION_DURATION_MINUTES = 90;

const createSessionRow = (overrides = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  // weekday (0-6): 0=Sun, 1=Mon, ..., 6=Sat
  weekday: "1",
  period: "morning",
  startTime: "08:00:00",
  ...overrides,
});

const createEmptyForm = () => ({
  id: null,
  courseId: "",
  teacherId: "",
  className: "",
  maxStudents: "",
  roomNumber: "",
  registrationStart: "",
  registrationEnd: "",
  sessions: [createSessionRow()],
  classStartDate: "",
  classEndDate: "",
});

const getLocalDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDate = (value) => {
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const addDays = (date, days) => {
  const nextDate = new Date(date.getTime());
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const addMinutesToTime = (timeString, minutes) => {
  if (!timeString) return "";
  const [hours, minutesPart] = timeString.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutesPart)) return timeString;

  const totalMinutes = hours * 60 + minutesPart + minutes;
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const nextHours = Math.floor(normalizedMinutes / 60);
  const nextMinutes = normalizedMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}:00`;
};

const getNextWeekdayDate = (referenceDate, weekday) => {
  const nextDate = new Date(referenceDate.getTime());
  const targetWeekday = Number(weekday);
  const currentWeekday = nextDate.getDay();
  const offset = (targetWeekday - currentWeekday + 7) % 7;
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
};

const getTimeOptionsForPeriod = (period) =>
  TIME_OPTIONS[period] || TIME_OPTIONS.morning;

const normalizeTimeToHms = (value) => {
  if (!value) return "";

  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const sanitizeSessionTimeByPeriod = (period, startTime) => {
  const normalizedPeriod = period || "morning";
  const normalizedTime = normalizeTimeToHms(startTime);
  const timeOptions = getTimeOptionsForPeriod(normalizedPeriod);

  if (timeOptions.includes(normalizedTime)) {
    return normalizedTime;
  }

  return timeOptions[0] || TIME_OPTIONS.morning[0];
};

const getSessionEndTime = (startTime) =>
  addMinutesToTime(startTime, DEFAULT_SESSION_DURATION_MINUTES);

const getScheduleDateTime = (schedule) => {
  if (!schedule?.lessonDate || !schedule?.startTime) return null;

  const dateTime = new Date(`${schedule.lessonDate}T${schedule.startTime}`);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
};

const getUpcomingSchedule = (schedules = [], referenceDate = new Date()) =>
  schedules.find((schedule) => {
    const scheduleDateTime = getScheduleDateTime(schedule);
    return scheduleDateTime && scheduleDateTime >= referenceDate;
  }) || null;

const isFutureOrToday = (dateKey, referenceKey) =>
  Boolean(dateKey && referenceKey && dateKey >= referenceKey);

const uniqueSessionsFromSchedules = (schedules = []) => {
  // Extract unique (weekday, startTime) combinations from schedules
  const sessionMap = new Map();

  schedules.forEach((schedule) => {
    if (!schedule.lessonDate || !schedule.startTime) return;

    const dateObj = toLocalDate(schedule.lessonDate);
    if (!dateObj) return;

    const weekday = String(dateObj.getDay());
    const startTime = schedule.startTime?.slice(0, 8) || "08:00:00";
    const period = startTime < "12:00:00" ? "morning" : "afternoon";
    const sanitized = sanitizeSessionTimeByPeriod(period, startTime);

    const key = `${weekday}-${sanitized}`;
    if (!sessionMap.has(key)) {
      sessionMap.set(key, {
        weekday,
        period,
        startTime: sanitized,
      });
    }
  });

  return Array.from(sessionMap.values()).map((session) =>
    createSessionRow(session),
  );
};

const generateSchedulesFromSessions = ({
  sessions,
  classStartDate,
  classEndDate,
  roomNumber,
}) => {
  const startDate = toLocalDate(classStartDate);
  const finalDate = toLocalDate(classEndDate);

  if (!startDate || !finalDate) return [];

  return sessions
    .flatMap((session) => {
      // Find first occurrence of this weekday on or after startDate
      const firstDate = getNextWeekdayDate(startDate, session.weekday);
      const occurrenceDates = [];
      let cursor = new Date(firstDate.getTime());

      console.debug(
        "[generateSchedulesFromSessions] Generating for weekday:",
        session.weekday,
        "startTime:",
        session.startTime,
        "firstDate:",
        firstDate,
      );

      while (cursor <= finalDate) {
        occurrenceDates.push(new Date(cursor.getTime()));
        cursor = addDays(cursor, 7);
      }

      console.debug(
        "[generateSchedulesFromSessions] Generated",
        occurrenceDates.length,
        "occurrences",
      );

      return occurrenceDates.map((lessonDate) => ({
        lessonDate: getLocalDateKey(lessonDate),
        startTime: session.startTime,
        endTime: getSessionEndTime(session.startTime),
        roomNumber,
        weekday: String(lessonDate.getDay()),
      }));
    })
    .sort((left, right) => {
      const leftDate = new Date(`${left.lessonDate}T${left.startTime}`);
      const rightDate = new Date(`${right.lessonDate}T${right.startTime}`);
      return leftDate - rightDate;
    });
};

const formatTime = (dateTime) => {
  if (!dateTime) return "--:--";

  if (/^\d{2}:\d{2}/.test(dateTime)) {
    return dateTime.slice(0, 5);
  }

  try {
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return dateTime.slice(0, 5);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateTime.slice(0, 5);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "--/--/----";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => createEmptyForm());
  const [now, setNow] = useState(() => new Date());
  const editFormRef = React.useRef(null);

  const fetchPageData = async () => {
    setLoading(true);
    setError("");

    const [classResult, courseResult, teacherResult, scheduleResult] =
      await Promise.allSettled([
        apiClient.get("/classes"),
        apiClient.get("/courses"),
        apiClient.get("/teachers"),
        apiClient.get("/schedules"),
      ]);

    if (classResult.status === "fulfilled")
      setClasses(classResult.value.data || []);
    if (courseResult.status === "fulfilled")
      setCourses(courseResult.value.data || []);
    if (teacherResult.status === "fulfilled")
      setTeachers(teacherResult.value.data || []);
    if (scheduleResult.status === "fulfilled")
      setSchedules(scheduleResult.value.data || []);

    const failedCalls = [
      classResult,
      courseResult,
      teacherResult,
      scheduleResult,
    ].filter((item) => item.status === "rejected");

    if (failedCalls.length === 4) {
      setError("Không thể tải dữ liệu lớp học lúc này.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPageData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const filteredClasses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return classes;

    return classes.filter((cls) =>
      [cls.className, cls.course?.name, cls.teacher?.user?.fullname]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [classes, searchTerm]);

  const summary = useMemo(() => {
    const totalClasses = classes.length;
    const classesWithTeacher = classes.filter(
      (cls) => cls.teacher?.teacherId,
    ).length;
    const activeClasses = classes.filter((cls) => {
      const now = new Date();
      const startDate = cls.startDate ? new Date(cls.startDate) : null;
      const endDate = cls.endDate ? new Date(cls.endDate) : null;
      return startDate && endDate && startDate <= now && now <= endDate;
    }).length;
    const enrolledStudents = classes.reduce(
      (total, cls) => total + (cls.enrolledStudents || 0),
      0,
    );

    return {
      totalClasses,
      classesWithTeacher,
      activeClasses,
      enrolledStudents,
    };
  }, [classes]);

  const resetForm = () => {
    setForm(createEmptyForm());
  };

  const getSchedulesForClass = (classId) => {
    return schedules
      .filter(
        (schedule) =>
          String(schedule.classEntityId ?? schedule.classId) ===
          String(classId),
      )
      .slice()
      .sort((left, right) => {
        const leftDate = getScheduleDateTime(left);
        const rightDate = getScheduleDateTime(right);

        if (!leftDate && !rightDate) return 0;
        if (!leftDate) return 1;
        if (!rightDate) return -1;

        return leftDate - rightDate;
      });
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    return teacher?.user?.fullname || "Chưa gán giáo viên";
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || "Khóa học không tồn tại";
  };

  const addSession = () => {
    setForm((current) => ({
      ...current,
      sessions: [...current.sessions, createSessionRow()],
    }));
  };

  const updateSession = (sessionId, field, value) => {
    setForm((current) => ({
      ...current,
      sessions: current.sessions.map((session) => {
        if (session.id !== sessionId) return session;

        const nextSession = { ...session, [field]: value };
        if (field === "period") {
          const nextTimeOptions = getTimeOptionsForPeriod(value);
          if (!nextTimeOptions.includes(nextSession.startTime)) {
            nextSession.startTime = nextTimeOptions[0];
          }
        }

        if (field === "startTime") {
          nextSession.startTime =
            normalizeTimeToHms(value) ||
            sanitizeSessionTimeByPeriod(
              nextSession.period,
              nextSession.startTime,
            );
        }

        return nextSession;
      }),
    }));
  };

  const removeSession = (sessionId) => {
    setForm((current) => {
      const nextSessions = current.sessions.filter(
        (session) => session.id !== sessionId,
      );

      return {
        ...current,
        sessions: nextSessions.length > 0 ? nextSessions : [createSessionRow()],
      };
    });
  };

  const syncClassSchedules = async ({
    classId,
    existingSchedules,
    classStartDate,
    classEndDate,
    roomNumber,
    sessions,
  }) => {
    console.debug("[syncClassSchedules] existingSchedules:", existingSchedules);
    console.debug("[syncClassSchedules] sessions:", sessions);
    console.debug(
      "[syncClassSchedules] classStartDate:",
      classStartDate,
      "classEndDate:",
      classEndDate,
    );

    const generatedSchedules = generateSchedulesFromSessions({
      sessions,
      classStartDate,
      classEndDate,
      roomNumber,
    });
    console.debug(
      "[syncClassSchedules] generatedSchedules:",
      generatedSchedules,
    );

    const cutoffDate = getLocalDateKey(new Date());
    const futureSchedules = existingSchedules.filter((schedule) =>
      isFutureOrToday(schedule.lessonDate, cutoffDate),
    );
    const pastSchedules = existingSchedules.filter(
      (schedule) => !isFutureOrToday(schedule.lessonDate, cutoffDate),
    );

    console.debug(
      "[syncClassSchedules] futureSchedules count:",
      futureSchedules.length,
    );
    console.debug(
      "[syncClassSchedules] pastSchedules count:",
      pastSchedules.length,
    );
    console.debug(
      "[syncClassSchedules] generatedSchedules count:",
      generatedSchedules.length,
    );

    // Delete all future schedules
    if (futureSchedules.length > 0) {
      console.debug(
        "[syncClassSchedules] Deleting",
        futureSchedules.length,
        "future schedules",
      );
      await Promise.all(
        futureSchedules.map(async (schedule) => {
          try {
            const res = await apiClient.delete(
              `/schedules/${schedule.scheduleId ?? schedule.id}`,
            );
            console.debug("[syncClassSchedules] delete response:", res?.status);
            return res;
          } catch (deleteErr) {
            console.error(
              "[syncClassSchedules] delete error:",
              deleteErr?.response?.status,
              deleteErr?.response?.data,
            );
            throw deleteErr;
          }
        }),
      );
      console.debug("[syncClassSchedules] Deleted successfully");
    }

    // Filter out past schedules from generated list (don't create schedules for past dates)
    const todayKey = getLocalDateKey(new Date());
    const futureGeneratedSchedules = generatedSchedules.filter((schedule) =>
      isFutureOrToday(schedule.lessonDate, todayKey),
    );

    console.debug(
      "[syncClassSchedules] Future generated schedules to post:",
      futureGeneratedSchedules.length,
    );

    // Create new future schedules
    if (futureGeneratedSchedules.length > 0) {
      console.debug(
        "[syncClassSchedules] Posting",
        futureGeneratedSchedules.length,
        "new schedules",
      );
      await Promise.all(
        futureGeneratedSchedules.map(async (schedule) => {
          try {
            const res = await apiClient.post("/schedules", {
              classId,
              lessonDate: schedule.lessonDate,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              roomNumber: schedule.roomNumber,
            });
            console.debug("[syncClassSchedules] post response:", res?.status);
            return res;
          } catch (postErr) {
            console.error(
              "[syncClassSchedules] post error:",
              postErr?.response?.status,
              postErr?.response?.data,
            );
            throw postErr;
          }
        }),
      );
      console.debug("[syncClassSchedules] Posted successfully");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    if (!form.courseId || !form.teacherId) {
      setError("Vui lòng chọn khóa học và giáo viên.");
      setSubmitting(false);
      return;
    }

    if (!form.roomNumber.trim()) {
      setError("Vui lòng nhập phòng học cho các buổi học.");
      setSubmitting(false);
      return;
    }

    const normalizedSessions = form.sessions.map((session) => ({
      ...session,
      startTime: sanitizeSessionTimeByPeriod(session.period, session.startTime),
    }));

    if (normalizedSessions.length === 0) {
      setError("Vui lòng thêm ít nhất một buổi học.");
      setSubmitting(false);
      return;
    }

    if (!form.classStartDate || !form.classEndDate) {
      setError("Vui lòng chọn ngày bắt đầu và kết thúc của lớp học.");
      setSubmitting(false);
      return;
    }

    const currentClassId = form.id;
    const existingSchedules = currentClassId
      ? getSchedulesForClass(currentClassId)
      : [];

    const payload = {
      courseId: Number(form.courseId),
      teacherId: Number(form.teacherId),
      className: form.className.trim(),
      maxStudents: Number(form.maxStudents || 30),
      registrationStart: form.registrationStart || null,
      registrationEnd: form.registrationEnd || null,
      startDate: new Date(`${form.classStartDate}T00:00:00`).toISOString(),
      endDate: new Date(`${form.classEndDate}T00:00:00`).toISOString(),
    };

    try {
      const response = form.id
        ? await apiClient.put(`/classes/${form.id}`, payload)
        : await apiClient.post("/classes", payload);

      const savedClass = response?.data || {};
      const savedClassId = savedClass.id ?? savedClass.classId ?? form.id;

      // Compare sessions by semantic meaning (without id), not by JSON stringify
      const shouldSyncSchedules = (() => {
        if (!form.id) return true; // new class

        const originalSessions = form._originalSessions || [];
        const sessionsChanged =
          originalSessions.length !== normalizedSessions.length ||
          originalSessions.some(
            (orig, idx) =>
              normalizedSessions[idx]?.weekday !== orig.weekday ||
              normalizedSessions[idx]?.period !== orig.period ||
              normalizedSessions[idx]?.startTime !== orig.startTime,
          );

        console.debug("[handleSubmit] sessionsChanged:", sessionsChanged);
        if (sessionsChanged) return true;

        if ((form._originalRoomNumber || "") !== form.roomNumber.trim())
          return true;

        if ((form._originalClassStartDate || "") !== form.classStartDate)
          return true;

        if ((form._originalClassEndDate || "") !== form.classEndDate)
          return true;

        return false;
      })();

      console.debug("[handleSubmit] shouldSyncSchedules:", shouldSyncSchedules);

      if (shouldSyncSchedules) {
        await syncClassSchedules({
          classId: savedClassId,
          existingSchedules,
          classStartDate: form.classStartDate,
          classEndDate: form.classEndDate,
          roomNumber: form.roomNumber.trim(),
          sessions: normalizedSessions,
        });
      }

      setMessage(
        form.id
          ? "Đã cập nhật lớp học và lịch học thành công."
          : "Đã tạo lớp học mới và gán lịch học.",
      );

      resetForm();
      await fetchPageData();
    } catch (submitError) {
      console.error("Lỗi lưu lớp học:", submitError);
      setError(
        submitError?.response?.data?.message ||
          "Không thể lưu lớp học lúc này.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (classItem) => {
    const classSchedules = getSchedulesForClass(classItem.id);
    const todayKey = getLocalDateKey(new Date());
    const editableSchedules = classSchedules.filter((schedule) =>
      isFutureOrToday(schedule.lessonDate, todayKey),
    );
    const nextSessions = uniqueSessionsFromSchedules(editableSchedules);

    // Remove id field for comparison (since id is auto-generated)
    const sessionsForComparison = nextSessions.map((session) => ({
      weekday: session.weekday,
      period: session.period,
      startTime: session.startTime,
    }));

    setForm({
      id: classItem.id,
      courseId: classItem.course?.id || "",
      teacherId: classItem.teacher?.teacherId || "",
      className: classItem.className || "",
      maxStudents: classItem.maxStudents || 30,
      roomNumber: classSchedules[0]?.roomNumber || "",
      registrationStart: classItem.registrationStart
        ? classItem.registrationStart.slice(0, 16)
        : "",
      registrationEnd: classItem.registrationEnd
        ? classItem.registrationEnd.slice(0, 16)
        : "",
      sessions: nextSessions.length > 0 ? nextSessions : [createSessionRow()],
      classStartDate: classItem.startDate
        ? classItem.startDate.split("T")[0]
        : "",
      classEndDate: classItem.endDate ? classItem.endDate.split("T")[0] : "",
      _originalSessions: sessionsForComparison,
      _originalRoomNumber: classSchedules[0]?.roomNumber || "",
      _originalClassStartDate: classItem.startDate
        ? classItem.startDate.split("T")[0]
        : "",
      _originalClassEndDate: classItem.endDate
        ? classItem.endDate.split("T")[0]
        : "",
    });
    setMessage("");
    setError("");

    // Scroll to edit form
    if (editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleDelete = async (classItem) => {
    const confirmed = window.confirm(`Xóa lớp học "${classItem.className}"?`);
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await apiClient.delete(`/classes/${classItem.id}`);
      setMessage("Đã xóa lớp học.");
      if (form.id === classItem.id) {
        resetForm();
      }
      await fetchPageData();
    } catch (deleteError) {
      console.error("Lỗi xóa lớp học:", deleteError);
      setError(
        deleteError?.response?.data?.message || "Không thể xóa lớp học này.",
      );
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải quản lý lớp học...
      </div>
    );
  }

  return (
    <div className="student-dashboard admin-page">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Quản lý lớp học</span>
          <h1>
            Quản lý các lớp học, gán giáo viên, và theo dõi tình hình tuyển sinh
          </h1>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            Tình hình lớp học
          </div>
          <h3>{summary.totalClasses} lớp học đang có trên hệ thống</h3>
          <p>
            {summary.classesWithTeacher} lớp đã được gán giáo viên,{" "}
            {summary.activeClasses} lớp đang hoạt động, với tổng cộng{" "}
            {summary.enrolledStudents} học viên.
          </p>

          <div className="highlight-meta-grid">
            <div>
              <span>Tổng lớp học</span>
              <strong>{summary.totalClasses}</strong>
            </div>
            <div>
              <span>Đã gán giáo viên</span>
              <strong>{summary.classesWithTeacher}</strong>
            </div>
            <div>
              <span>Đang hoạt động</span>
              <strong>{summary.activeClasses}</strong>
            </div>
            <div>
              <span>Học viên tuyển sinh</span>
              <strong>{summary.enrolledStudents}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon teal">
            <i className="ph ph-chalkboard"></i>
          </div>
          <div>
            <strong>{summary.totalClasses}</strong>
            <span>Tổng lớp học</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-chalkboard-teacher"></i>
          </div>
          <div>
            <strong>{summary.classesWithTeacher}</strong>
            <span>Đã gán giáo viên</span>
            <small>Lớp học có giáo viên dạy được chỉ định</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-clock"></i>
          </div>
          <div>
            <strong>{summary.activeClasses}</strong>
            <span>Lớp đang hoạt động</span>
            <small>Lớp học nằm trong khoảng thời gian hoạt động</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-users"></i>
          </div>
          <div>
            <strong>{summary.enrolledStudents}</strong>
            <span>Học viên tuyển sinh</span>
            <small>Tổng học viên đã đăng ký các lớp học</small>
          </div>
        </article>
      </section>

      <section className="dashboard-detail-grid">
        <div className="dashboard-surface" ref={editFormRef}>
          <div className="surface-header">
            <div>
              <h2>{form.id ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}</h2>
            </div>
            {form.id && (
              <button
                type="button"
                className="surface-link-btn"
                onClick={resetForm}
              >
                Tạo mới thay vì sửa
              </button>
            )}
          </div>

          {(message || error) && (
            <div className={`teacher-inline-message ${error ? "error" : ""}`}>
              {error || message}
            </div>
          )}

          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label className="teacher-field">
              <span>Khóa học</span>
              <select
                value={form.courseId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    courseId: event.target.value,
                  }))
                }
                required
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="teacher-field">
              <span>Giáo viên dạy</span>
              <select
                value={form.teacherId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    teacherId: event.target.value,
                  }))
                }
                required
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.user?.fullname} ({teacher.specialization})
                  </option>
                ))}
              </select>
            </label>

            <label className="teacher-field">
              <span>Phòng học</span>
              <input
                value={form.roomNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    roomNumber: event.target.value,
                  }))
                }
                placeholder="VD: A1, B2, 301"
                required
              />
            </label>

            <label className="teacher-field">
              <span>Tên lớp</span>
              <input
                value={form.className}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    className: event.target.value,
                  }))
                }
                placeholder="VD: Lớp A1, Lớp B2"
                required
              />
            </label>

            <label className="teacher-field">
              <span>Sĩ số tối đa</span>
              <input
                type="number"
                min="1"
                max="100"
                value={form.maxStudents}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    maxStudents: event.target.value,
                  }))
                }
              />
            </label>

            <label className="teacher-field">
              <span>Bắt đầu lớp học</span>
              <input
                type="date"
                value={form.classStartDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    classStartDate: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="teacher-field">
              <span>Kết thúc lớp học</span>
              <input
                type="date"
                value={form.classEndDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    classEndDate: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="teacher-field">
              <span>Bắt đầu đăng ký</span>
              <input
                type="datetime-local"
                value={form.registrationStart}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    registrationStart: event.target.value,
                  }))
                }
              />
            </label>

            <label className="teacher-field">
              <span>Kết thúc đăng ký</span>
              <input
                type="datetime-local"
                value={form.registrationEnd}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    registrationEnd: event.target.value,
                  }))
                }
              />
            </label>

            <div className="teacher-field" style={{ gridColumn: "1 / -1" }}>
              <strong>Lịch buổi học (lặp lại hàng tuần)</strong>
              <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                {form.sessions.map((session) => {
                  const startTimeOptions = getTimeOptionsForPeriod(
                    session.period,
                  );

                  return (
                    <div
                      key={session.id}
                      className="admin-form-grid"
                      style={{
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        alignItems: "end",
                        gap: "12px",
                      }}
                    >
                      <label className="teacher-field">
                        <span>Thứ</span>
                        <select
                          value={session.weekday}
                          onChange={(event) =>
                            updateSession(
                              session.id,
                              "weekday",
                              event.target.value,
                            )
                          }
                        >
                          {WEEKDAY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="teacher-field">
                        <span>Buổi học</span>
                        <select
                          value={session.period}
                          onChange={(event) =>
                            updateSession(
                              session.id,
                              "period",
                              event.target.value,
                            )
                          }
                        >
                          {PERIOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="teacher-field">
                        <span>Giờ bắt đầu</span>
                        <select
                          value={session.startTime}
                          onChange={(event) =>
                            updateSession(
                              session.id,
                              "startTime",
                              event.target.value,
                            )
                          }
                        >
                          {startTimeOptions.map((timeOption) => (
                            <option key={timeOption} value={timeOption}>
                              {timeOption.slice(0, 5)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div
                        className="admin-form-actions"
                        style={{ marginTop: 0, gridColumn: "3 / 4" }}
                      >
                        <button
                          type="button"
                          className="attendance-status-btn danger"
                          onClick={() => removeSession(session.id)}
                          disabled={form.sessions.length === 1}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="admin-form-actions" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="attendance-status-btn"
                  onClick={addSession}
                >
                  Thêm buổi học
                </button>
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="teacher-save-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Đang lưu..."
                  : form.id
                    ? "Lưu thay đổi"
                    : "Tạo lớp học"}
              </button>
              <button
                type="button"
                className="attendance-status-btn"
                onClick={resetForm}
                disabled={submitting}
              >
                Xóa biểu mẫu
              </button>
            </div>
          </form>
        </div>

        <div className="dashboard-detail-stack">
          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Tra cứu nhanh</h2>
                <p>Lọc danh sách để tìm lớp học cần sửa trong ngày.</p>
              </div>
            </div>

            <label className="teacher-field">
              <span>Từ khóa</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tên lớp, khóa học, giáo viên..."
              />
            </label>
          </div>

          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Danh sách lớp học</h2>
              </div>
            </div>

            <div className="admin-list">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => {
                  const classSchedules = getSchedulesForClass(classItem.id);
                  const nextSchedule = getUpcomingSchedule(classSchedules, now);

                  return (
                    <article key={classItem.id} className="admin-course-row">
                      <div className="admin-course-copy">
                        <div className="admin-list-topline">
                          <span>{classItem.course?.level || "CLASS"}</span>
                          <strong>
                            {classItem.enrolledStudents || 0}/
                            {classItem.maxStudents || 30} học viên
                          </strong>
                        </div>
                        <h3>{classItem.className}</h3>
                        <p>{getCourseName(classItem.course?.id)}</p>
                        <div className="course-card-meta">
                          <span>
                            {getTeacherName(classItem.teacher?.teacherId)}
                          </span>
                          <span>
                            {classItem.startDate
                              ? `${formatDate(classItem.startDate)} - ${formatDate(classItem.endDate)}`
                              : "Chưa có lịch học"}
                          </span>
                          <span>
                            {nextSchedule
                              ? `Buổi tới: ${formatDate(nextSchedule.lessonDate)} • ${formatTime(nextSchedule.startTime)}`
                              : "Chưa có buổi học sắp tới"}
                          </span>
                        </div>
                      </div>

                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="attendance-status-btn"
                          onClick={() => handleEdit(classItem)}
                        >
                          <i className="ph ph-pencil-simple"></i>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="attendance-status-btn danger"
                          onClick={() => handleDelete(classItem)}
                        >
                          <i className="ph ph-trash"></i>
                          Xóa
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="dashboard-empty-state">
                  Không tìm thấy lớp học phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
