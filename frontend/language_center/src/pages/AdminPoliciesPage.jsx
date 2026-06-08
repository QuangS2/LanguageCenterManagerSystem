import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../service/apiClient";

const EMPTY_POLICY_FORM = {
  id: null,
  name: "",
  discountPercent: "",
  description: "",
  active: true,
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function AdminPoliciesPage() {
  const [discounts, setDiscounts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_POLICY_FORM);

  const fetchPolicyData = async () => {
    setLoading(true);
    setError("");

    const [discountResult, courseResult] = await Promise.allSettled([
      apiClient.get("/discounts"),
      apiClient.get("/courses"),
    ]);

    if (discountResult.status === "fulfilled")
      setDiscounts(discountResult.value.data || []);
    if (courseResult.status === "fulfilled")
      setCourses(courseResult.value.data || []);

    if (
      discountResult.status === "rejected" &&
      courseResult.status === "rejected"
    ) {
      setError("Không thể tải dữ liệu học phí và chính sách.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPolicyData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const activeDiscounts = discounts.filter((item) => item.active);
  const tuitionSummary = useMemo(() => {
    const total = courses.reduce(
      (sum, course) => sum + Number(course.tuitionFee || 0),
      0,
    );
    const average = courses.length > 0 ? total / courses.length : 0;

    return {
      average,
      max:
        courses.length > 0
          ? Math.max(...courses.map((item) => Number(item.tuitionFee || 0)))
          : 0,
      min:
        courses.length > 0
          ? Math.min(...courses.map((item) => Number(item.tuitionFee || 0)))
          : 0,
    };
  }, [courses]);

  const resetForm = () => setForm(EMPTY_POLICY_FORM);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const payload = {
      name: form.name.trim(),
      discountPercent: Number(form.discountPercent || 0),
      description: form.description.trim(),
      active: Boolean(form.active),
    };

    try {
      if (form.id) {
        await apiClient.put(`/discounts/${form.id}`, payload);
        setMessage("Đã cập nhật chính sách ưu đãi.");
      } else {
        await apiClient.post("/discounts", payload);
        setMessage("Đã tạo chính sách ưu đãi mới.");
      }

      resetForm();
      await fetchPolicyData();
    } catch (submitError) {
      console.error("Lỗi lưu ưu đãi:", submitError);
      setError(
        submitError?.response?.data?.message ||
          "Không thể lưu chính sách ưu đãi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (discount) => {
    const confirmed = window.confirm(`Xóa chính sách "${discount.name}"?`);
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await apiClient.delete(`/discounts/${discount.id}`);
      setMessage("Đã xóa chính sách ưu đãi.");
      if (form.id === discount.id) resetForm();
      await fetchPolicyData();
    } catch (deleteError) {
      console.error("Lỗi xóa ưu đãi:", deleteError);
      setError("Không thể xóa chính sách này.");
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải cấu hình học phí...
      </div>
    );
  }

  return (
    <div className="student-dashboard admin-page">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Học phí & chính sách</span>
          <h1>
            Quản lý ưu đãi, chính sách giảm giá và mặt bằng học phí giữa các
            khóa học
          </h1>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            Chính sách đang hoạt động
          </div>
          <h3>{activeDiscounts.length} ưu đãi đang bật cho hệ thống</h3>

          <div className="highlight-meta-grid">
            <div>
              <span>Học phí TB</span>
              <strong>{formatCurrency(tuitionSummary.average)} đ</strong>
            </div>
            <div>
              <span>Học phí thấp nhất</span>
              <strong>{formatCurrency(tuitionSummary.min)} đ</strong>
            </div>
            <div>
              <span>Học phí cao nhất</span>
              <strong>{formatCurrency(tuitionSummary.max)} đ</strong>
            </div>
            <div>
              <span>Tổng chính sách</span>
              <strong>{discounts.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon teal">
            <i className="ph ph-ticket"></i>
          </div>
          <div>
            <strong>{activeDiscounts.length}</strong>
            <span>Ưu đãi đang bật</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-currency-circle-dollar"></i>
          </div>
          <div>
            <strong>{formatCurrency(tuitionSummary.average)} đ</strong>
            <span>Mặt bằng học phí</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-chart-bar"></i>
          </div>
          <div>
            <strong>{courses.length}</strong>
            <span>Khóa học đã cấu hình giá</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-percent"></i>
          </div>
          <div>
            <strong>
              {discounts.length > 0
                ? Math.max(
                    ...discounts.map((item) =>
                      Number(item.discountPercent || 0),
                    ),
                  )
                : 0}
              %
            </strong>
            <span>Mức ưu đãi cao nhất</span>
          </div>
        </article>
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
                {form.id ? "Chỉnh sửa chính sách" : "Tạo chính sách ưu đãi"}
              </h2>
              <p>Áp dụng cho cấu hình giảm giá toàn hệ thống.</p>
            </div>
            {form.id && (
              <button
                type="button"
                className="surface-link-btn"
                onClick={resetForm}
              >
                Tạo chính sách mới
              </button>
            )}
          </div>

          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label className="teacher-field">
              <span>Tên chính sách</span>
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
              <span>Phần trăm giảm</span>
              <input
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discountPercent: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="teacher-field">
              <span>Trạng thái</span>
              <select
                value={String(form.active)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.value === "true",
                  }))
                }
              >
                <option value="true">Đang bật</option>
                <option value="false">Tạm tắt</option>
              </select>
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
                    ? "Lưu chính sách"
                    : "Tạo chính sách"}
              </button>
              <button
                type="button"
                className="attendance-status-btn"
                onClick={resetForm}
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
                <h2>Danh sách chính sách</h2>
                <p>Sửa, bật/tắt hoặc xóa từng ưu đãi đang có.</p>
              </div>
            </div>

            <div className="admin-list">
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <article key={discount.id} className="admin-course-row">
                    <div className="admin-course-copy">
                      <div className="admin-list-topline">
                        <span>{discount.active ? "ĐANG BẬT" : "TẠM TẮT"}</span>
                        <strong>Giảm {discount.discountPercent}%</strong>
                      </div>
                      <h3>{discount.name}</h3>
                      <p>
                        {discount.description ||
                          "Chưa có mô tả bổ sung cho chính sách này."}
                      </p>
                    </div>

                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="attendance-status-btn"
                        onClick={() =>
                          setForm({
                            id: discount.id,
                            name: discount.name || "",
                            discountPercent: discount.discountPercent || "",
                            description: discount.description || "",
                            active: Boolean(discount.active),
                          })
                        }
                      >
                        <i className="ph ph-pencil-simple"></i>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="attendance-status-btn danger"
                        onClick={() => handleDelete(discount)}
                      >
                        <i className="ph ph-trash"></i>
                        Xóa
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Chưa có chính sách ưu đãi nào được tạo.
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Mặt bằng học phí hiện tại</h2>
              </div>
            </div>

            <div className="admin-list">
              {[...courses]
                .sort(
                  (left, right) =>
                    Number(right.tuitionFee || 0) -
                    Number(left.tuitionFee || 0),
                )
                .map((course) => (
                  <article key={course.id} className="admin-list-card">
                    <div className="admin-list-topline">
                      <span>{course.level || "COURSE"}</span>
                      <strong>{formatCurrency(course.tuitionFee)} đ</strong>
                    </div>
                    <h3>{course.name}</h3>
                    <p>
                      {course.defaultClassName || "Chưa có lớp mặc định"} •{" "}
                      {course.teacherName || "Chưa gán giáo viên"}
                    </p>
                  </article>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
