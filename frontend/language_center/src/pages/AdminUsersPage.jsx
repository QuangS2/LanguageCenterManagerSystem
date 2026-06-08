import React, { useEffect, useMemo, useState, useRef } from "react";
import apiClient from "../service/apiClient";

const EMPTY_TEACHER_FORM = {
  teacherId: null,
  userId: null,
  fullname: "",
  username: "",
  password: "",
  email: "",
  age: "",
  specialization: "",
};

const EMPTY_STUDENT_FORM = {
  id: null,
  userId: null,
  fullname: "",
  email: "",
  age: "",
  dateOfBirth: "",
  phone: "",
  address: "",
};

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherForm, setTeacherForm] = useState(EMPTY_TEACHER_FORM);
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT_FORM);
  const [submittingTeacher, setSubmittingTeacher] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const [submittingStudent, setSubmittingStudent] = useState(false);

  const fetchAdminUsers = async () => {
    setLoading(true);
    setError("");

    const [teacherResult, studentResult, userResult, classResult] =
      await Promise.allSettled([
        apiClient.get("/teachers"),
        apiClient.get("/students"),
        apiClient.get("/users", { params: { size: 100, page: 0 } }),
        apiClient.get("/classes"),
      ]);

    if (teacherResult.status === "fulfilled")
      setTeachers(teacherResult.value.data || []);
    if (studentResult.status === "fulfilled")
      setStudents(studentResult.value.data || []);
    if (userResult.status === "fulfilled")
      setUsers(userResult.value.data?.content || []);
    if (classResult.status === "fulfilled")
      setClasses(classResult.value.data || []);

    const failedCalls = [
      teacherResult,
      studentResult,
      userResult,
      classResult,
    ].filter((item) => item.status === "rejected");

    if (failedCalls.length === 4) {
      setError("Không thể tải dữ liệu giáo viên và học viên lúc này.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const userMap = useMemo(
    () =>
      users.reduce((accumulator, user) => {
        accumulator[user.id] = user;
        return accumulator;
      }, {}),
    [users],
  );

  const teacherClassCounts = useMemo(() => {
    return classes.reduce((accumulator, item) => {
      const teacherId = item.teacher?.teacherId;
      if (!teacherId) return accumulator;

      accumulator[teacherId] = (accumulator[teacherId] || 0) + 1;
      return accumulator;
    }, {});
  }, [classes]);

  const teacherRows = useMemo(() => {
    return teachers.map((teacher) => {
      const user = userMap[teacher.userId] || {};

      return {
        ...teacher,
        fullName: teacher.userName || user.name || "Giảng viên",
        username: user.username || "",
        email: user.email || "",
        age: user.age || "",
        active: user.active ?? true,
        classCount: teacherClassCounts[teacher.teacherId] || 0,
      };
    });
  }, [teacherClassCounts, teachers, userMap]);

  const studentRows = useMemo(() => {
    return students.map((student) => {
      const user = userMap[student.userId] || {};

      return {
        ...student,
        fullName: student.fullName || user.name || "Học viên",
        age: user.age || "",
        active: user.active ?? true,
      };
    });
  }, [students, userMap]);

  const resetTeacherForm = () => setTeacherForm(EMPTY_TEACHER_FORM);
  const resetStudentForm = () => setStudentForm(EMPTY_STUDENT_FORM);

  const handleTeacherSubmit = async (event) => {
    event.preventDefault();
    setSubmittingTeacher(true);
    setMessage("");
    setError("");

    try {
      if (teacherForm.teacherId && teacherForm.userId) {
        await apiClient.put(`/users/${teacherForm.userId}`, {
          fullname: teacherForm.fullname.trim(),
          age: Number(teacherForm.age || 0),
          email: teacherForm.email.trim(),
        });
        await apiClient.put(`/teachers/${teacherForm.teacherId}`, {
          userId: teacherForm.userId,
          specialization: teacherForm.specialization.trim(),
        });
        setMessage("Đã cập nhật hồ sơ giảng viên.");
      } else {
        const userResponse = await apiClient.post("/users", {
          fullname: teacherForm.fullname.trim(),
          username: teacherForm.username.trim(),
          password: teacherForm.password,
          role: "TEACHER",
        });

        const userId = userResponse.data.id;

        await apiClient.put(`/users/${userId}`, {
          fullname: teacherForm.fullname.trim(),
          age: Number(teacherForm.age || 0),
          email: teacherForm.email.trim(),
        });

        await apiClient.post("/teachers", {
          userId,
          specialization: teacherForm.specialization.trim(),
        });

        setMessage("Đã tạo tài khoản giảng viên mới.");
      }

      resetTeacherForm();
      await fetchAdminUsers();
    } catch (submitError) {
      console.error("Lỗi lưu giảng viên:", submitError);
      setError(
        submitError?.response?.data?.message ||
          "Không thể lưu thông tin giảng viên.",
      );
    } finally {
      setSubmittingTeacher(false);
    }
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();
    if (!studentForm.id || !studentForm.userId) return;

    setSubmittingStudent(true);
    setMessage("");
    setError("");

    try {
      await apiClient.put(`/users/${studentForm.userId}`, {
        fullname: studentForm.fullname.trim(),
        age: Number(studentForm.age || 0),
        email: studentForm.email.trim(),
      });
      await apiClient.put(`/students/${studentForm.id}`, {
        dateOfBirth: studentForm.dateOfBirth,
        phone: studentForm.phone,
        address: studentForm.address,
      });
      setMessage("Đã cập nhật hồ sơ học viên.");
      resetStudentForm();
      await fetchAdminUsers();
    } catch (submitError) {
      console.error("Lỗi lưu học viên:", submitError);
      setError(
        submitError?.response?.data?.message ||
          "Không thể lưu thông tin học viên.",
      );
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    const confirmed = window.confirm("Khóa tài khoản này?");
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await apiClient.put(`/users/${userId}/deactivate`);
      setMessage("Đã khóa tài khoản.");
      await fetchAdminUsers();
    } catch (deactivateError) {
      console.error("Lỗi khóa tài khoản:", deactivateError);
      setError("Không thể khóa tài khoản này.");
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải quản lý người dùng...
      </div>
    );
  }

  return (
    <div className="student-dashboard admin-page">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Giảng viên & học viên</span>
          <h1>Quản lý hồ sơ đội ngũ giảng dạy và học viên đang theo học</h1>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            Quy mô nhân sự và học viên
          </div>
          <h3>
            {teacherRows.length} giảng viên và {studentRows.length} học viên
            đang có hồ sơ trên hệ thống
          </h3>

          <div className="highlight-meta-grid">
            <div>
              <span>Giảng viên hoạt động</span>
              <strong>
                {teacherRows.filter((item) => item.active).length}
              </strong>
            </div>
            <div>
              <span>Học viên hoạt động</span>
              <strong>
                {studentRows.filter((item) => item.active).length}
              </strong>
            </div>
            <div>
              <span>Tổng tài khoản</span>
              <strong>{users.length}</strong>
            </div>
            <div>
              <span>Lớp đang vận hành</span>
              <strong>{classes.length}</strong>
            </div>
          </div>
        </div>
      </section>

      {(message || error) && (
        <div className={`teacher-inline-message ${error ? "error" : ""}`}>
          {error || message}
        </div>
      )}

      <section className="dashboard-detail-grid">
        <div className="dashboard-surface">
          <div className="surface-header">
            <div>
              <h2>
                {teacherForm.teacherId
                  ? "Chỉnh sửa giảng viên"
                  : "Tạo giảng viên mới"}
              </h2>
            </div>
            {teacherForm.teacherId && (
              <button
                type="button"
                className="surface-link-btn"
                onClick={resetTeacherForm}
              >
                Tạo giảng viên mới
              </button>
            )}
          </div>

          <form className="admin-form-grid" onSubmit={handleTeacherSubmit}>
            <label className="teacher-field">
              <span>Họ và tên</span>
              <input
                value={teacherForm.fullname}
                onChange={(event) =>
                  setTeacherForm((current) => ({
                    ...current,
                    fullname: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="teacher-field">
              <span>Email</span>
              <input
                type="email"
                value={teacherForm.email}
                onChange={(event) =>
                  setTeacherForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="teacher-field">
              <span>Tuổi</span>
              <input
                type="number"
                min="18"
                value={teacherForm.age}
                onChange={(event) =>
                  setTeacherForm((current) => ({
                    ...current,
                    age: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="teacher-field">
              <span>Chuyên môn</span>
              <input
                value={teacherForm.specialization}
                onChange={(event) =>
                  setTeacherForm((current) => ({
                    ...current,
                    specialization: event.target.value,
                  }))
                }
                required
              />
            </label>

            {!teacherForm.teacherId && (
              <>
                <label className="teacher-field">
                  <span>Tên đăng nhập</span>
                  <input
                    value={teacherForm.username}
                    onChange={(event) =>
                      setTeacherForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="teacher-field">
                  <span>Mật khẩu</span>
                  <input
                    type="password"
                    value={teacherForm.password}
                    onChange={(event) =>
                      setTeacherForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </>
            )}

            {/* Import moved to a dedicated panel to avoid accidental clicks inside teacher form */}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="teacher-save-btn"
                disabled={submittingTeacher}
              >
                {submittingTeacher
                  ? "Đang lưu..."
                  : teacherForm.teacherId
                    ? "Lưu giảng viên"
                    : "Tạo giảng viên"}
              </button>
              <button
                type="button"
                className="attendance-status-btn"
                onClick={resetTeacherForm}
              >
                Làm trống
              </button>
            </div>
          </form>
        </div>

        <div className="dashboard-detail-stack">
          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Import học viên (Excel)</h2>
                <p>
                  Tải file Excel để tạo hàng loạt tài khoản học viên (CSV mật
                  khẩu sẽ được trả về).
                </p>
              </div>
            </div>

            <div style={{ padding: 12 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null);
                  setImportResult(null);
                }}
              />

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  className="teacher-save-btn"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  disabled={importing}
                >
                  Chọn file
                </button>

                <div style={{ minWidth: 220 }}>
                  {importFile ? importFile.name : "Chưa chọn file"}
                </div>

                <button
                  type="button"
                  className="attendance-status-btn"
                  onClick={async () => {
                    if (!importFile) return;
                    setImporting(true);
                    setImportResult(null);

                    try {
                      const form = new FormData();
                      form.append("file", importFile);

                      const resp = await apiClient.post(
                        "/admin/import-students",
                        form,
                        { headers: { "Content-Type": "multipart/form-data" } },
                      );

                      setImportResult(resp.data || { created: 0, errors: [] });
                      // refresh lists after import
                      await fetchAdminUsers();
                    } catch (err) {
                      console.error("Lỗi import học viên:", err);
                      setImportResult({
                        error: err?.response?.data || String(err),
                      });
                    } finally {
                      setImporting(false);
                    }
                  }}
                  disabled={!importFile || importing}
                >
                  {importing ? "Đang import..." : "Import Excel"}
                </button>
              </div>

              {importResult && (
                <div
                  className="teacher-inline-message"
                  style={{ marginTop: 8 }}
                >
                  {importResult.error ? (
                    <div style={{ color: "#b91c1c" }}>
                      Lỗi: {String(importResult.error)}
                    </div>
                  ) : (
                    <div>
                      <div>Đã tạo: {importResult.created || 0} học viên</div>
                      <div>Thất bại: {importResult.failed || 0} dòng</div>
                      {importResult.reportRows &&
                        importResult.reportRows.length > 0 && (
                          <div>
                            Tổng xử lý: {importResult.reportRows.length} dòng.
                          </div>
                        )}
                      {importResult.reportRows &&
                        importResult.reportRows.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            <button
                              type="button"
                              className="attendance-status-btn"
                              onClick={() => {
                                const rows = [
                                  [
                                    "rowNumber",
                                    "status",
                                    "fullname",
                                    "username",
                                    "email",
                                    "dateOfBirth",
                                    "age",
                                    "phone",
                                    "address",
                                    "tempPassword",
                                    "errorReason",
                                  ],
                                  ...importResult.reportRows.map((r) => [
                                    r.rowNumber || "",
                                    r.status || "",
                                    r.fullname || "",
                                    r.username || "",
                                    r.email || "",
                                    r.dateOfBirth || "",
                                    r.age || "",
                                    r.phone || "",
                                    r.address || "",
                                    r.tempPassword || "",
                                    r.errorReason || "",
                                  ]),
                                ];
                                const csv = rows
                                  .map((r) =>
                                    r
                                      .map(
                                        (v) =>
                                          `"${String(v).replace(/"/g, '""')}"`,
                                      )
                                      .join(","),
                                  )
                                  .join("\n");
                                const blob = new Blob([csv], {
                                  type: "text/csv;charset=utf-8;",
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "import-students-report.csv";
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Tải CSV báo cáo import
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Danh sách giảng viên</h2>
                <p>Chỉnh sửa nhanh hoặc khóa tài khoản nếu cần.</p>
              </div>
            </div>

            <div className="admin-list">
              {teacherRows.map((teacher) => (
                <article key={teacher.teacherId} className="admin-course-row">
                  <div className="admin-course-copy">
                    <div className="admin-list-topline">
                      <span>{teacher.specialization || "TEACHER"}</span>
                      <strong>{teacher.classCount} lớp</strong>
                    </div>
                    <h3>{teacher.fullName}</h3>
                    <p>
                      {teacher.email ||
                        teacher.username ||
                        "Chưa cập nhật liên hệ"}
                    </p>
                    <div className="course-card-meta">
                      <span>{teacher.username}</span>
                      <span>
                        {teacher.age
                          ? `${teacher.age} tuổi`
                          : "Chưa cập nhật tuổi"}
                      </span>
                      <span>
                        {teacher.active ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="attendance-status-btn"
                      onClick={() =>
                        setTeacherForm({
                          teacherId: teacher.teacherId,
                          userId: teacher.userId,
                          fullname: teacher.fullName || "",
                          username: teacher.username || "",
                          password: "",
                          email: teacher.email || "",
                          age: teacher.age || "",
                          specialization: teacher.specialization || "",
                        })
                      }
                    >
                      <i className="ph ph-pencil-simple"></i>
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="attendance-status-btn danger"
                      onClick={() => handleDeactivateUser(teacher.userId)}
                    >
                      <i className="ph ph-lock"></i>
                      Khóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Chỉnh sửa học viên</h2>
              </div>
              {studentForm.id && (
                <button
                  type="button"
                  className="surface-link-btn"
                  onClick={resetStudentForm}
                >
                  Bỏ chọn học viên
                </button>
              )}
            </div>

            {studentForm.id && (
              <form
                className="admin-form-grid compact"
                onSubmit={handleStudentSubmit}
              >
                <label className="teacher-field">
                  <span>Họ và tên</span>
                  <input
                    value={studentForm.fullname}
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        fullname: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="teacher-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="teacher-field">
                  <span>Tuổi</span>
                  <input
                    type="number"
                    min="5"
                    value={studentForm.age}
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        age: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="teacher-field">
                  <span>Ngày sinh</span>
                  <input
                    value={studentForm.dateOfBirth}
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        dateOfBirth: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="teacher-field">
                  <span>Điện thoại</span>
                  <input
                    value={studentForm.phone}
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="teacher-field full">
                  <span>Địa chỉ</span>
                  <input
                    value={studentForm.address}
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="admin-form-actions">
                  <button
                    type="submit"
                    className="teacher-save-btn"
                    disabled={submittingStudent}
                  >
                    {submittingStudent ? "Đang lưu..." : "Lưu học viên"}
                  </button>
                </div>
              </form>
            )}

            <div className="admin-list">
              {studentRows.map((student) => (
                <article key={student.id} className="admin-course-row">
                  <div className="admin-course-copy">
                    <div className="admin-list-topline">
                      <span>{student.username || "STUDENT"}</span>
                      <strong>
                        {student.active ? "Đang hoạt động" : "Đã khóa"}
                      </strong>
                    </div>
                    <h3>{student.fullName}</h3>
                    <p>
                      {student.email || "Chưa cập nhật email"} •{" "}
                      {student.phone || "Chưa cập nhật số điện thoại"}
                    </p>
                    <div className="course-card-meta">
                      <span>
                        {student.age
                          ? `${student.age} tuổi`
                          : "Chưa cập nhật tuổi"}
                      </span>
                      <span>
                        {student.dateOfBirth || "Chưa cập nhật ngày sinh"}
                      </span>
                      <span>{student.address || "Chưa cập nhật địa chỉ"}</span>
                    </div>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="attendance-status-btn"
                      onClick={() =>
                        setStudentForm({
                          id: student.id,
                          userId: student.userId,
                          fullname: student.fullName || "",
                          email: student.email || "",
                          age: student.age || "",
                          dateOfBirth: student.dateOfBirth || "",
                          phone: student.phone || "",
                          address: student.address || "",
                        })
                      }
                    >
                      <i className="ph ph-pencil-simple"></i>
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="attendance-status-btn danger"
                      onClick={() => handleDeactivateUser(student.userId)}
                    >
                      <i className="ph ph-lock"></i>
                      Khóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
