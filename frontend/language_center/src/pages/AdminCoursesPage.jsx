import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../service/apiClient";

const EMPTY_FORM = {
  id: null,
  name: "",
  level: "BEGINNER",
  durationWeeks: "",
  duration: "",
  tuitionFee: "",
  imageUrl: "",
  description: "",
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");
const formatTime = (value) => (value ? value.slice(0, 5) : "--:--");

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchCourses = async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/courses", {
        params: {
          keyword: keyword.trim(),
          visible: false,
        },
      });
      setCourses(response.data || []);
    } catch (fetchError) {
      console.error("Lỗi tải khóa học cho admin:", fetchError);
      setError("Không thể tải danh sách khóa học lúc này.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) =>
      [
        course.name,
        course.description,
        course.teacherName,
        course.defaultClassName,
        course.level,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [courses, searchTerm]);

  const summary = useMemo(() => {
    const totalTuition = courses.reduce(
      (total, item) => total + Number(item.tuitionFee || 0),
      0,
    );
    const coursesWithClass = courses.filter(
      (item) => item.defaultClassName,
    ).length;

    return {
      totalCourses: courses.length,
      averageTuition: courses.length > 0 ? totalTuition / courses.length : 0,
      highestTuition:
        courses.length > 0
          ? Math.max(...courses.map((item) => Number(item.tuitionFee || 0)))
          : 0,
      coursesWithClass,
    };
  }, [courses]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const payload = {
      name: form.name.trim(),
      level: form.level,
      durationWeeks: form.durationWeeks.trim(),
      duration: form.duration.trim(),
      tuitionFee: Number(form.tuitionFee || 0),
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
    };

    try {
      if (form.id) {
        await apiClient.put(`/courses/${form.id}`, payload);
        setMessage("Đã cập nhật khóa học thành công.");
      } else {
        await apiClient.post("/courses", payload);
        setMessage("Đã tạo khóa học mới.");
      }

      resetForm();
      await fetchCourses(searchTerm);
    } catch (submitError) {
      console.error("Lỗi lưu khóa học:", submitError);
      setError(
        submitError?.response?.data?.message ||
          "Không thể lưu khóa học lúc này.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setForm({
      id: course.id,
      name: course.name || "",
      level: course.level || "BEGINNER",
      durationWeeks: course.durationWeeks || "",
      duration: course.duration || "",
      tuitionFee: course.tuitionFee || "",
      imageUrl: course.imageUrl || "",
      description: course.description || "",
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (course) => {
    const confirmed = window.confirm(`Xóa khóa học "${course.name}"?`);
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await apiClient.delete(`/courses/${course.id}`);
      setMessage("Đã xóa khóa học.");
      if (form.id === course.id) {
        resetForm();
      }
      await fetchCourses(searchTerm);
    } catch (deleteError) {
      console.error("Lỗi xóa khóa học:", deleteError);
      setError(
        deleteError?.response?.data?.message ||
          "Không thể xóa khóa học này. Nếu khóa học đã được gán lớp, hãy giữ lại và cập nhật nội dung thay vì xóa.",
      );
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải quản lý khóa học...
      </div>
    );
  }

  return (
    <div className="student-dashboard admin-page">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Khóa học & chương trình</span>
          <h1>
            Quản lý danh mục khóa học, học phí và thông tin hiển thị cho học
            viên
          </h1>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            Tình hình danh mục
          </div>
          <h3>{summary.totalCourses} khóa học đang có trên hệ thống</h3>

          <div className="highlight-meta-grid">
            <div>
              <span>Học phí TB</span>
              <strong>{formatCurrency(summary.averageTuition)} đ</strong>
            </div>
            <div>
              <span>Học phí cao nhất</span>
              <strong>{formatCurrency(summary.highestTuition)} đ</strong>
            </div>
            <div>
              <span>Đã mở lớp mặc định</span>
              <strong>{summary.coursesWithClass}</strong>
            </div>
            <div>
              <span>Đang lọc</span>
              <strong>{filteredCourses.length} khóa học</strong>
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
            <strong>{summary.totalCourses}</strong>
            <span>Tổng khóa học</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-wallet"></i>
          </div>
          <div>
            <strong>{formatCurrency(summary.averageTuition)} đ</strong>
            <span>Học phí trung bình</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-calendar-check"></i>
          </div>
          <div>
            <strong>{summary.coursesWithClass}</strong>
            <span>Đã có lớp mặc định</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-magnifying-glass"></i>
          </div>
          <div>
            <strong>{filteredCourses.length}</strong>
            <span>Kết quả đang xem</span>
            <small>Lọc theo tên, mô tả, giáo viên hoặc lớp mặc định</small>
          </div>
        </article>
      </section>

      <section className="dashboard-detail-grid">
        <div className="dashboard-surface">
          <div className="surface-header">
            <div>
              <h2>{form.id ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</h2>
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
              <span>Tên khóa học</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="teacher-field">
              <span>Trình độ</span>
              <select
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    level: event.target.value,
                  }))
                }
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </label>

            <label className="teacher-field">
              <span>Số tuần</span>
              <input
                value={form.durationWeeks}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationWeeks: event.target.value,
                  }))
                }
                placeholder="VD: 12"
              />
            </label>

            <label className="teacher-field">
              <span>Thời lượng hiển thị</span>
              <input
                value={form.duration}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    duration: event.target.value,
                  }))
                }
                placeholder="VD: 3 months"
              />
            </label>

            <label className="teacher-field">
              <span>Học phí</span>
              <input
                type="number"
                min="0"
                value={form.tuitionFee}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tuitionFee: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="teacher-field">
              <span>Ảnh đại diện URL</span>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </label>

            <label className="teacher-field full">
              <span>Mô tả</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
              />
            </label>

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
                    : "Tạo khóa học"}
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
                <p>Lọc danh sách để tìm khóa học cần sửa trong ngày.</p>
              </div>
            </div>

            <label className="teacher-field">
              <span>Từ khóa</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tên khóa học, giáo viên, lớp mặc định..."
              />
            </label>
          </div>

          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Danh sách khóa học</h2>
              </div>
            </div>

            <div className="admin-list">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <article key={course.id} className="admin-course-row">
                    <div className="admin-course-copy">
                      <div className="admin-list-topline">
                        <span>{course.level || "COURSE"}</span>
                        <strong>{formatCurrency(course.tuitionFee)} đ</strong>
                      </div>
                      <h3>{course.name}</h3>
                      <p>
                        {course.description ||
                          "Chưa có mô tả ngắn cho khóa học này."}
                      </p>
                    </div>

                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="attendance-status-btn"
                        onClick={() => handleEdit(course)}
                      >
                        <i className="ph ph-pencil-simple"></i>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="attendance-status-btn danger"
                        onClick={() => handleDelete(course)}
                      >
                        <i className="ph ph-trash"></i>
                        Xóa
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Không tìm thấy khóa học phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
