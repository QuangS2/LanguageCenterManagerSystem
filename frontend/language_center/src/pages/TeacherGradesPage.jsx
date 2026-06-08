import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../service/apiClient";

const MIN_GRADE = 0;
const MAX_GRADE = 10;

const getResultLabel = (midtermValue, finalValue) => {
  const midterm = Number(midtermValue);
  const finalGrade = Number(finalValue);

  if (!Number.isFinite(midterm) || !Number.isFinite(finalGrade)) {
    return "Chưa đủ điểm";
  }

  return (midterm + finalGrade) / 2 >= 5 ? "PASS" : "FAIL";
};

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const parseGrade = (value) => {
  if (value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const isGradeInRange = (value) =>
  Number.isFinite(value) && value >= MIN_GRADE && value <= MAX_GRADE;

export default function TeacherGradesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [selectedClassId, setSelectedClassId] = useState("");
  const [message, setMessage] = useState("");
  const [savingStudentId, setSavingStudentId] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get("/me/classes");
        const nextClasses = response.data || [];
        setClasses(nextClasses);
        if (nextClasses.length > 0) {
          setSelectedClassId(String(nextClasses[0].classId));
        }
      } catch (fetchError) {
        console.error("Lỗi tải danh sách lớp cho bảng điểm:", fetchError);
        setError("Không thể tải dữ liệu bảng điểm giáo viên lúc này.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setGradeDrafts({});
      return;
    }

    const fetchClassDetails = async () => {
      try {
        const [studentResult, gradeResult] = await Promise.allSettled([
          apiClient.get(`/classes/${selectedClassId}/students`),
          apiClient.get(`/grades/class/${selectedClassId}`),
        ]);

        const nextStudents =
          studentResult.status === "fulfilled"
            ? studentResult.value.data || []
            : [];
        const gradeList =
          gradeResult.status === "fulfilled"
            ? gradeResult.value.data || []
            : [];
        const gradeMap = gradeList.reduce((accumulator, item) => {
          accumulator[item.studentId] = {
            gradeId: item.gradeId,
            midtermGrade: item.midtermGrade ?? "",
            finalGrade: item.finalGrade ?? "",
            comment: item.comment || "",
            result: item.result || "",
          };
          return accumulator;
        }, {});

        setStudents(nextStudents);
        setGradeDrafts(
          nextStudents.reduce((accumulator, student) => {
            accumulator[student.id] = gradeMap[student.id] || {
              gradeId: null,
              midtermGrade: "",
              finalGrade: "",
              comment: "",
              result: "",
            };
            return accumulator;
          }, {}),
        );
      } catch (fetchError) {
        console.error("Lỗi tải dữ liệu lớp cho bảng điểm:", fetchError);
        setStudents([]);
        setGradeDrafts({});
      }
    };

    fetchClassDetails();
  }, [selectedClassId]);

  const selectedClass = classes.find(
    (item) => String(item.classId) === String(selectedClassId),
  );

  const gradeSummary = useMemo(() => {
    const gradeRows = students
      .map((student) => ({ student, draft: gradeDrafts[student.id] }))
      .filter((item) => item.draft);

    const completed = gradeRows.filter(
      (item) => item.draft.midtermGrade !== "" && item.draft.finalGrade !== "",
    );
    const passCount = completed.filter(
      (item) =>
        getResultLabel(item.draft.midtermGrade, item.draft.finalGrade) ===
        "PASS",
    ).length;
    const average =
      completed.length > 0
        ? completed.reduce(
            (total, item) =>
              total +
              (Number(item.draft.midtermGrade) +
                Number(item.draft.finalGrade)) /
                2,
            0,
          ) / completed.length
        : 0;

    return {
      completedCount: completed.length,
      passCount,
      average,
    };
  }, [gradeDrafts, students]);

  const handleDraftChange = (studentId, field, value) => {
    setGradeDrafts((currentDrafts) => ({
      ...currentDrafts,
      [studentId]: {
        ...currentDrafts[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (studentId) => {
    const draft = gradeDrafts[studentId];
    if (!draft) return;

    const midtermGrade = parseGrade(draft.midtermGrade);
    const finalGrade = parseGrade(draft.finalGrade);

    if (midtermGrade === null || finalGrade === null) {
      setMessage("Vui lòng nhập đủ điểm giữa kỳ và cuối kỳ trước khi lưu.");
      return;
    }

    if (!isGradeInRange(midtermGrade) || !isGradeInRange(finalGrade)) {
      setMessage("Điểm chỉ được phép trong khoảng từ 0 đến 10.");
      return;
    }

    setSavingStudentId(studentId);
    setMessage("");

    const payload = {
      studentId,
      classId: Number(selectedClassId),
      midtermGrade,
      finalGrade,
      comment: draft.comment || "",
    };

    try {
      const response = draft.gradeId
        ? await apiClient.put(`/grades/${draft.gradeId}`, payload)
        : await apiClient.post("/grades", payload);

      setGradeDrafts((currentDrafts) => ({
        ...currentDrafts,
        [studentId]: {
          gradeId: response.data.gradeId,
          midtermGrade: response.data.midtermGrade,
          finalGrade: response.data.finalGrade,
          comment: response.data.comment || "",
          result: response.data.result || "",
        },
      }));
      setMessage("Đã lưu điểm cho học viên.");
    } catch (saveError) {
      console.error("Lỗi lưu điểm:", saveError);
      setMessage("Không thể lưu điểm lúc này. Vui lòng thử lại.");
    } finally {
      setSavingStudentId(null);
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải bảng điểm giảng viên...
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
          <span className="hero-kicker">Nhập điểm học viên</span>
          <h1>
            Cập nhật đầu điểm theo lớp với thao tác gọn và nhìn được tiến độ
            ngay
          </h1>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            {selectedClass ? "Lớp đang nhập điểm" : "Chưa có lớp"}
          </div>
          <h3>{selectedClass?.className || "Chưa được phân lớp"}</h3>
          <p>
            {selectedClass
              ? `${selectedClass.course?.courseName || selectedClass.course?.name || "Khóa học"} • ${formatDateTime(selectedClass.startDate)}`
              : ""}
          </p>

          <div className="highlight-meta-grid">
            <div>
              <span>Sĩ số</span>
              <strong>{students.length} học viên</strong>
            </div>
            <div>
              <span>Đã nhập đủ điểm</span>
              <strong>{gradeSummary.completedCount}</strong>
            </div>
            <div>
              <span>Đạt yêu cầu</span>
              <strong>{gradeSummary.passCount}</strong>
            </div>
            <div>
              <span>Điểm trung bình</span>
              <strong>
                {gradeSummary.average ? gradeSummary.average.toFixed(1) : "--"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon teal">
            <i className="ph ph-exam"></i>
          </div>
          <div>
            <strong>{gradeSummary.completedCount}</strong>
            <span>Bài điểm đã hoàn chỉnh</span>
            <small>Đã có đủ điểm giữa kỳ và cuối kỳ</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-chart-line-up"></i>
          </div>
          <div>
            <strong>
              {gradeSummary.average ? gradeSummary.average.toFixed(1) : "--"}
            </strong>
            <span>Điểm trung bình lớp</span>
            <small>Tính trên các học viên đã nhập đủ điểm</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-check-fat"></i>
          </div>
          <div>
            <strong>{gradeSummary.passCount}</strong>
            <span>Học viên đạt</span>
            <small>Phân loại tự động theo điểm trung bình</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-warning-circle"></i>
          </div>
          <div>
            <strong>
              {Math.max(
                gradeSummary.completedCount - gradeSummary.passCount,
                0,
              )}
            </strong>
            <span>Cần cải thiện</span>
          </div>
        </article>
      </section>

      <section className="teacher-tool-grid">
        <div className="dashboard-surface">
          <div className="surface-header">
            <div>
              <h2>Bảng điểm theo lớp</h2>
            </div>
          </div>

          <div className="teacher-filter-grid single">
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
          </div>

          {message && <div className="teacher-inline-message">{message}</div>}

          <div className="teacher-grade-list">
            {students.length > 0 ? (
              students.map((student) => {
                const draft = gradeDrafts[student.id] || {};
                const resultLabel = getResultLabel(
                  draft.midtermGrade,
                  draft.finalGrade,
                );

                return (
                  <article key={student.id} className="teacher-grade-card">
                    <div className="teacher-grade-head">
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

                      <span
                        className={`teacher-grade-result ${resultLabel === "PASS" ? "pass" : resultLabel === "FAIL" ? "fail" : ""}`}
                      >
                        {resultLabel}
                      </span>
                    </div>

                    <div className="teacher-grade-form">
                      <label className="teacher-field compact">
                        <span>Giữa kỳ</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={draft.midtermGrade}
                          onChange={(event) =>
                            handleDraftChange(
                              student.id,
                              "midtermGrade",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="teacher-field compact">
                        <span>Cuối kỳ</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={draft.finalGrade}
                          onChange={(event) =>
                            handleDraftChange(
                              student.id,
                              "finalGrade",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="teacher-field grow">
                        <span>Nhận xét</span>
                        <input
                          type="text"
                          value={draft.comment}
                          onChange={(event) =>
                            handleDraftChange(
                              student.id,
                              "comment",
                              event.target.value,
                            )
                          }
                          placeholder="Ví dụ: ổn định phần nghe, cần tăng tốc độ đọc"
                        />
                      </label>
                    </div>

                    <div className="teacher-grade-actions">
                      <div className="teacher-grade-note">
                        Kết quả sẽ tự tính theo trung bình giữa kỳ và cuối kỳ.
                      </div>
                      <button
                        type="button"
                        className="teacher-save-btn"
                        disabled={savingStudentId === student.id}
                        onClick={() => handleSave(student.id)}
                      >
                        {savingStudentId === student.id
                          ? "Đang lưu..."
                          : "Lưu điểm"}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                Lớp này hiện chưa có học viên để nhập điểm.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
