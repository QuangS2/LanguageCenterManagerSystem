import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../service/apiClient";

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      setLoading(true);
      setError("");

      const [
        courseResult,
        teacherResult,
        studentResult,
        discountResult,
        classResult,
      ] = await Promise.allSettled([
        apiClient.get("/courses"),
        apiClient.get("/teachers"),
        apiClient.get("/students"),
        apiClient.get("/discounts"),
        apiClient.get("/classes"),
      ]);

      if (courseResult.status === "fulfilled")
        setCourses(courseResult.value.data || []);
      if (teacherResult.status === "fulfilled")
        setTeachers(teacherResult.value.data || []);
      if (studentResult.status === "fulfilled")
        setStudents(studentResult.value.data || []);
      if (discountResult.status === "fulfilled")
        setDiscounts(discountResult.value.data || []);
      if (classResult.status === "fulfilled")
        setClasses(classResult.value.data || []);

      const failedCalls = [
        courseResult,
        teacherResult,
        studentResult,
        discountResult,
        classResult,
      ].filter((item) => item.status === "rejected");

      if (failedCalls.length === 5) {
        setError("Không thể tải dữ liệu quản trị vào lúc này.");
      }

      setLoading(false);
    };

    fetchAdminOverview();
  }, []);

  const teacherClassCounts = useMemo(() => {
    return classes.reduce((accumulator, item) => {
      const teacherId = item.teacher?.teacherId;
      if (!teacherId) return accumulator;

      accumulator[teacherId] = (accumulator[teacherId] || 0) + 1;
      return accumulator;
    }, {});
  }, [classes]);

  const activeDiscounts = discounts.filter((item) => item.active);
  const averageTuition =
    courses.length > 0
      ? courses.reduce(
          (total, item) => total + Number(item.tuitionFee || 0),
          0,
        ) / courses.length
      : 0;
  const activeClasses = classes.filter(
    (item) => String(item.status || "").toUpperCase() === "ACTIVE",
  );
  const featuredTeachers = [...teachers]
    .sort(
      (left, right) =>
        (teacherClassCounts[right.teacherId] || 0) -
        (teacherClassCounts[left.teacherId] || 0),
    )
    .slice(0, 4);
  const highValueCourses = [...courses]
    .sort(
      (left, right) =>
        Number(right.tuitionFee || 0) - Number(left.tuitionFee || 0),
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        Đang tải bảng điều phối quản trị...
      </div>
    );
  }

  if (error) {
    return <div className="student-dashboard-loading error">{error}</div>;
  }

  return (
    <div className="student-dashboard admin-page">
      <section className="student-dashboard-hero">
        <div className="hero-main-copy">
          <span className="hero-kicker">Trung tâm điều phối</span>
          <h1>
            Quản trị khóa học, đội ngũ giảng dạy và chính sách học phí trên cùng
            một màn hình
          </h1>

          <div className="hero-pill-row">
            <button
              type="button"
              className="hero-pill-btn"
              onClick={() => navigate("/admin/courses")}
            >
              <i className="ph ph-books"></i>
              Quản lý khóa học
            </button>
            <button
              type="button"
              className="hero-pill-btn secondary"
              onClick={() => navigate("/admin/policies")}
            >
              <i className="ph ph-receipt"></i>
              Học phí và chính sách
            </button>
          </div>
        </div>

        <div className="hero-highlight-card">
          <div className="highlight-topline">
            <span className="status-dot"></span>
            Toàn cảnh vận hành
          </div>
          <h3>
            {courses.length} khóa học, {classes.length} lớp và {teachers.length}{" "}
            giảng viên đang được quản lý
          </h3>

          <div className="highlight-meta-grid">
            <div>
              <span>Lớp đang hoạt động</span>
              <strong>{activeClasses.length}</strong>
            </div>
            <div>
              <span>Chính sách đang bật</span>
              <strong>{activeDiscounts.length}</strong>
            </div>
            <div>
              <span>Học viên trong hệ thống</span>
              <strong>{students.length}</strong>
            </div>
            <div>
              <span>Học phí trung bình</span>
              <strong>{formatCurrency(averageTuition)} đ</strong>
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
            <strong>{courses.length}</strong>
            <span>Khóa học đang quản lý</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon navy">
            <i className="ph ph-chalkboard-teacher"></i>
          </div>
          <div>
            <strong>{teachers.length}</strong>
            <span>Giảng viên</span>
            <small>Đội ngũ đang được phân công lớp</small>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon amber">
            <i className="ph ph-student"></i>
          </div>
          <div>
            <strong>{students.length}</strong>
            <span>Học viên</span>
          </div>
        </article>
        <article className="student-stat-card">
          <div className="student-stat-icon danger">
            <i className="ph ph-ticket"></i>
          </div>
          <div>
            <strong>{activeDiscounts.length}</strong>
            <span>Ưu đãi đang hiệu lực</span>
            <small>Dùng cho cấu hình học phí và chiến dịch tuyển sinh</small>
          </div>
        </article>
      </section>

      <section className="dashboard-detail-grid">
        <div className="dashboard-surface">
          <div className="surface-header">
            <div>
              <h2>Khóa học trọng điểm theo học phí</h2>
            </div>
            <button
              type="button"
              className="surface-link-btn"
              onClick={() => navigate("/admin/courses")}
            >
              Mở quản lý khóa học
            </button>
          </div>

          <div className="admin-list">
            {highValueCourses.map((course) => (
              <article key={course.id} className="admin-list-card">
                <div className="admin-list-topline">
                  <span>{course.level || "COURSE"}</span>
                  <strong>{formatCurrency(course.tuitionFee)} đ</strong>
                </div>
                <h3>{course.name}</h3>
                <p>
                  {course.teacherName || "Đang sắp xếp giáo viên"} •{" "}
                  {course.defaultClassName || "Chưa mở lớp mặc định"}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-detail-stack">
          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Giảng viên đang phụ trách nhiều lớp</h2>
              </div>
              <button
                type="button"
                className="surface-link-btn"
                onClick={() => navigate("/admin/users")}
              >
                Mở quản lý người dùng
              </button>
            </div>

            <div className="compact-list">
              {featuredTeachers.length > 0 ? (
                featuredTeachers.map((teacher) => (
                  <article key={teacher.teacherId} className="admin-mini-card">
                    <strong>{teacher.userName}</strong>
                    <span>
                      {teacher.specialization || "Chưa cập nhật chuyên môn"}
                    </span>
                    <small>
                      {teacherClassCounts[teacher.teacherId] || 0} lớp đang phụ
                      trách
                    </small>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Chưa có giảng viên nào để hiển thị.
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-surface">
            <div className="surface-header">
              <div>
                <h2>Chính sách học phí đang bật</h2>
              </div>
            </div>

            <div className="compact-list">
              {activeDiscounts.length > 0 ? (
                activeDiscounts.map((discount) => (
                  <article key={discount.id} className="admin-mini-card">
                    <strong>{discount.name}</strong>
                    <span>
                      {discount.description ||
                        "Ưu đãi đang được áp dụng trên hệ thống."}
                    </span>
                    <small>Giảm {discount.discountPercent}%</small>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  Hiện chưa có chính sách ưu đãi nào đang bật.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
