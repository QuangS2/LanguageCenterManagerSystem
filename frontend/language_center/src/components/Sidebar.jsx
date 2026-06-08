import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../service/apiClient";
import { ROLES } from "../data/mockData";

export default function Sidebar({ role, onLogout }) {
  // 1. ĐỒNG BỘ CHỮ THƯỜNG ĐỂ MATCH VỚI MOCKDATA
  const normalizedRole = (role || "student").toLowerCase();
  const userData = ROLES[normalizedRole] || ROLES["student"];

  const [profile, setProfile] = useState({
    fullName: "Đang tải...",
    email: "",
    age: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const normalizedPath = location.pathname.toLowerCase();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/me/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // 2. CẬP NHẬT HÀM CHUYỂN TRANG LINH HOẠT THEO ROLE
  const handleNavigate = (id) => {
    // Nếu click vào các nút có id là dashboard (tùy mockData của bạn đang đặt là gì)
    if (
      id === "s-dashboard" ||
      id === "t-dashboard" ||
      id === "dashboard" ||
      id === "a-dashboard"
    ) {
      if (normalizedRole === "teacher") navigate("/teacherdashboard");
      else if (normalizedRole === "admin") navigate("/admindashboard");
      else navigate("/studentdashboard");
    } else if (id === "t-attendance") navigate("/teacher/attendance");
    else if (id === "t-grades") navigate("/teacher/grades");
    else if (id === "a-courses") navigate("/admin/courses");
    else if (id === "a-classes") navigate("/admin/classes");
    else if (id === "a-users") navigate("/admin/users");
    else if (id === "a-policies") navigate("/admin/policies");
    else if (id === "s-courses") navigate("/courses");
    else if (id === "s-payment") navigate("/payments");
    else navigate(`/${id}`);
  };

  // 3. CẬP NHẬT HÀM CHECK ACTIVE
  const checkIsActive = (id) => {
    if (
      (id === "s-dashboard" ||
        id === "t-dashboard" ||
        id === "dashboard" ||
        id === "a-dashboard") &&
      (normalizedPath === "/studentdashboard" ||
        normalizedPath === "/teacherdashboard" ||
        normalizedPath === "/admindashboard")
    )
      return true;
    if (id === "t-attendance" && normalizedPath === "/teacher/attendance")
      return true;
    if (id === "t-grades" && normalizedPath === "/teacher/grades") return true;
    if (id === "a-courses" && normalizedPath === "/admin/courses") return true;
    if (id === "a-classes" && normalizedPath === "/admin/classes") return true;
    if (id === "a-users" && normalizedPath === "/admin/users") return true;
    if (id === "a-policies" && normalizedPath === "/admin/policies")
      return true;
    if (id === "s-courses" && normalizedPath === "/courses") return true;
    if (id === "s-payment" && normalizedPath === "/payments") return true;
    return false;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div
            className="brand-icon"
            style={{
              background:
                "linear-gradient(135deg, var(--teal), var(--teal-bright))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <i className="ph ph-books" style={{ fontSize: "24px" }}></i>
          </div>
          <div className="brand-name">LinguaHub</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{userData?.initials || "U"}</div>
        <div className="user-info">
          <div className="user-name">{profile.fullName}</div>
          <div className="user-role">{userData?.roleName}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {userData?.nav.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${checkIsActive(item.id) ? "active" : ""}`}
                onClick={() => handleNavigate(item.id)}
              >
                <i className={`ph ${item.icon}`}></i>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={onLogout}>
          <i className="ph ph-sign-out"></i> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
