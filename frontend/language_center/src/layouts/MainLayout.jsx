import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";
import apiClient from "../service/apiClient";

export default function MainLayout({ role, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const actionMenusRef = useRef(null);
  const normalizedRole = String(role || "student").toLowerCase();
  const normalizedPath = location.pathname.toLowerCase();
  const isStudentRole = normalizedRole === "student";
  const isTeacherRole = normalizedRole === "teacher";
  const isAdminRole = normalizedRole === "admin";
  const {
    cart,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    isCartOpen,
    isNotifOpen,
    setIsNotifOpen,
    removeFromCart,
    cartTotal,
  } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Đang tải...",
    email: "",
    username: "",
    roles: [],
    studentInfo: null,
  });

  const getPageTitle = () => {
    if (
      normalizedPath.includes("/studentdashboard") ||
      normalizedPath.includes("/teacherdashboard")
    )
      return "Tổng quan";
    if (normalizedPath.includes("/admindashboard")) return "Tổng quan quản trị";
    if (normalizedPath.includes("/teacher/attendance")) return "Điểm danh";
    if (normalizedPath.includes("/teacher/grades")) return "Nhập điểm";
    if (normalizedPath.includes("/admin/courses")) return "Quản lý khóa học";
    if (normalizedPath.includes("/admin/users"))
      return "Quản lý giáo viên và học viên";
    if (normalizedPath.includes("/admin/policies"))
      return "Học phí và chính sách";
    if (normalizedPath.includes("/courses")) return "Đăng ký Khóa học";
    if (normalizedPath.includes("/payments")) return "Thanh toán & Học phí";
    return "Hệ thống";
  };

  const showSearchBar = isStudentRole && normalizedPath.includes("/courses");
  const userInitial = (profile.fullName || "U").trim().charAt(0).toUpperCase();

  const notifications = useMemo(
    () => [
      isAdminRole
        ? {
            id: "admin-courses",
            title: "Khóa học mới cần cấu hình",
            description: "",
            time: "Vừa xong",
            accent: "teal",
          }
        : isTeacherRole
          ? {
              id: "attendance",
              title: "Danh sách lớp hôm nay đã sẵn sàng",
              description: "",
              time: "Vừa xong",
              accent: "teal",
            }
          : {
              id: "payment",
              title: "Học phí đợt mới đã sẵn sàng",
              description:
                cart.length > 0
                  ? `Bạn đang có ${cart.length} khóa học trong giỏ cần xác nhận thanh toán.`
                  : "",
              time: "Vừa xong",
              accent: "teal",
            },
      {
        id: "schedule",
        title: isAdminRole
          ? "Chính sách ưu đãi đang hoạt động"
          : isTeacherRole
            ? "Lịch dạy tuần này đã được cập nhật"
            : "Lịch học tuần này đã được cập nhật",
        description: isAdminRole ? "" : isTeacherRole ? "" : "",
        time: "10 phút trước",
        accent: "navy",
      },
      {
        id: "support",
        title: isAdminRole
          ? "Danh sách người dùng cần rà soát"
          : isTeacherRole
            ? "Hồ sơ giảng viên cần rà soát"
            : "Hồ sơ cá nhân cần rà soát",
        description: isAdminRole ? "" : isTeacherRole ? "" : "",
        time: "Hôm nay",
        accent: "amber",
      },
    ],
    [cart.length, isTeacherRole, isAdminRole],
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/me/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ topbar:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const closeMenusTimer = window.setTimeout(() => {
      setIsNotifOpen(false);
      setIsProfileOpen(false);
    }, 0);

    return () => window.clearTimeout(closeMenusTimer);
  }, [location.pathname, setIsNotifOpen]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        actionMenusRef.current &&
        !actionMenusRef.current.contains(event.target)
      ) {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [setIsCartOpen, setIsNotifOpen]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <div id="app">
      <Sidebar role={role} onLogout={onLogout} />

      <main className="main-content">
        {/* --- TOPBAR --- */}
        <div className="topbar">
          <div className="topbar-title">
            <h2>{getPageTitle()}</h2>
          </div>
          <div className="topbar-actions" ref={actionMenusRef}>
            {showSearchBar && (
              <div className="search-bar">
                <i className="ph ph-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {isStudentRole && (
              <button
                className="topbar-action-btn cart-trigger-btn"
                onClick={() => {
                  setIsCartOpen(true);
                  setIsNotifOpen(false);
                  setIsProfileOpen(false);
                }}
              >
                <span className="action-btn-icon">
                  <i className="ph ph-shopping-cart"></i>
                </span>
                <span className="action-btn-copy">
                  <strong>Giỏ hàng</strong>
                  <small>
                    {cart.length > 0
                      ? `${cart.length} khóa học`
                      : "Chưa có khóa học"}
                  </small>
                </span>
                {cart.length > 0 && (
                  <span className="cart-badge-top">{cart.length}</span>
                )}
              </button>
            )}

            <div className="topbar-action-menu">
              <button
                className={`btn-icon topbar-floating-btn ${isNotifOpen ? "active" : ""}`}
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileOpen(false);
                }}
                aria-label="Xem thông báo"
              >
                <i className="ph ph-bell"></i>
                <span className="notification-dot"></span>
              </button>
              {isNotifOpen && (
                <div className="topbar-popover notification-dropdown">
                  <div className="popover-header">
                    <div>
                      <h3>Thông báo</h3>
                      <p>{notifications.length} cập nhật dành cho bạn</p>
                    </div>
                    <button type="button" className="popover-link-btn">
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="notif-item"
                      >
                        <span className={`notif-accent ${item.accent}`}></span>
                        <div className="notif-content">
                          <div className="notif-topline">
                            <h4>{item.title}</h4>
                            <span>{item.time}</span>
                          </div>
                          <p>{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-action-menu">
              <button
                className={`profile-trigger-btn ${isProfileOpen ? "active" : ""}`}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                }}
                aria-label="Xem profile cá nhân"
              >
                <span className="profile-trigger-avatar">{userInitial}</span>
                <span className="profile-trigger-copy">
                  <strong>{profile.fullName}</strong>
                  <small>{profile.roles?.[0] || "STUDENT"}</small>
                </span>
                <i
                  className={`ph ${isProfileOpen ? "ph-caret-up" : "ph-caret-down"}`}
                ></i>
              </button>

              {isProfileOpen && (
                <div className="topbar-popover profile-dropdown">
                  <div className="profile-card-hero">
                    <div className="profile-card-avatar">{userInitial}</div>
                    <div className="profile-card-copy">
                      <h3>{profile.fullName}</h3>
                      <p>{profile.email || "Chưa cập nhật email"}</p>
                    </div>
                  </div>

                  <div className="profile-card-grid">
                    <div className="profile-stat-tile">
                      <span>Tài khoản</span>
                      <strong>{profile.username || "student"}</strong>
                    </div>
                    <div className="profile-stat-tile">
                      <span>Vai trò</span>
                      <strong>{profile.roles?.join(", ") || "STUDENT"}</strong>
                    </div>
                    <div className="profile-stat-tile">
                      <span>Ngày sinh</span>
                      <strong>
                        {isTeacherRole
                          ? profile.teacherInfo?.specialization ||
                            "Chưa cập nhật"
                          : isAdminRole
                            ? profile.profileType || "ADMIN"
                            : profile.studentInfo?.dateOfBirth ||
                              "Chưa cập nhật"}
                      </strong>
                    </div>
                    <div className="profile-stat-tile">
                      <span>
                        {isTeacherRole
                          ? "Tài khoản"
                          : isAdminRole
                            ? "Trạng thái"
                            : "Điện thoại"}
                      </span>
                      <strong>
                        {isTeacherRole
                          ? profile.username || "Chưa cập nhật"
                          : isAdminRole
                            ? profile.active
                              ? "Đang hoạt động"
                              : "Đã khóa"
                            : profile.studentInfo?.phone || "Chưa cập nhật"}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-action-list">
                    <button
                      type="button"
                      className="profile-action-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate(
                          isAdminRole
                            ? "/admin/courses"
                            : isTeacherRole
                              ? "/teacher/attendance"
                              : "/payments",
                        );
                      }}
                    >
                      <i
                        className={`ph ${isAdminRole ? "ph-books" : isTeacherRole ? "ph-check-square-offset" : "ph-wallet"}`}
                      ></i>
                      <span>
                        <strong>
                          {isAdminRole
                            ? "Quản lý khóa học"
                            : isTeacherRole
                              ? "Điểm danh lớp học"
                              : "Học phí và hóa đơn"}
                        </strong>
                        <small>
                          {isAdminRole
                            ? "Mở nhanh danh sách khóa học và chỉnh sửa học phí"
                            : isTeacherRole
                              ? "Mở nhanh danh sách buổi dạy cần cập nhật"
                              : "Xem trạng thái các khoản đang chờ"}
                        </small>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="profile-action-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate(
                          isAdminRole
                            ? "/admindashboard"
                            : isTeacherRole
                              ? "/teacherdashboard"
                              : "/studentdashboard",
                        );
                      }}
                    >
                      <i
                        className={`ph ${isAdminRole ? "ph-chart-pie-slice" : isTeacherRole ? "ph-chalkboard-teacher" : "ph-user-circle"}`}
                      ></i>
                      <span>
                        <strong>
                          {isAdminRole
                            ? "Tổng quan quản trị"
                            : isTeacherRole
                              ? "Tổng quan giảng dạy"
                              : "Hồ sơ học viên"}
                        </strong>
                        <small>
                          {isAdminRole
                            ? "Quay lại bảng điều phối quản trị"
                            : isTeacherRole
                              ? "Quay lại dashboard giảng viên"
                              : "Quay lại trang tổng quan cá nhân"}
                        </small>
                      </span>
                    </button>

                    {isTeacherRole && (
                      <button
                        type="button"
                        className="profile-action-btn"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/teacher/grades");
                        }}
                      >
                        <i className="ph ph-exam"></i>
                        <span>
                          <strong>Nhập điểm học viên</strong>
                        </span>
                      </button>
                    )}

                    {isAdminRole && (
                      <button
                        type="button"
                        className="profile-action-btn"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/admin/policies");
                        }}
                      >
                        <i className="ph ph-receipt"></i>
                        <span>
                          <strong>Học phí và chính sách</strong>
                          <small>
                            Quản lý giảm giá, chính sách ưu đãi và cấu hình học
                            phí
                          </small>
                        </span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="profile-logout-btn"
                    onClick={onLogout}
                  >
                    <i className="ph ph-sign-out"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- NỘI DUNG TRANG (Outlet sẽ render StudentDashboard hoặc Courses) --- */}
        <div className="page-wrapper">
          <Outlet />
        </div>

        <Footer />

        {/* --- PANEL GIỎ HÀNG --- */}
        {isStudentRole && isCartOpen && (
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
            <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cart-header">
                <div>
                  <span className="cart-kicker">Đăng ký học phí</span>
                  <h3>Giỏ hàng của bạn</h3>
                  <p>
                    {cart.length > 0
                      ? `Bạn đang giữ chỗ cho ${cart.length} khóa học.`
                      : "Thêm khóa học để bắt đầu thanh toán."}
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-close-cart"
                >
                  <i className="ph ph-x"></i>
                </button>
              </div>
              <div className="cart-body">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.cartKey || item.id} className="cart-item">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-meta">
                          <span>{item.level || "Khóa học"}</span>
                          <span>
                            {item.duration || `${item.durationWeeks || 0} tuần`}
                          </span>
                        </div>
                        <h4>{item.name}</h4>
                        <p>
                          {item.selectedClass?.className ||
                            item.className ||
                            "Lớp đang được chọn"}
                        </p>
                        <p>
                          {item.description ||
                            "Sẵn sàng cho bước xác nhận học phí."}
                        </p>
                        <div className="cart-item-price">
                          {item.tuitionFee?.toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => removeFromCart(item.cartKey || item.id)}
                      >
                        <i className="ph ph-trash"></i>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="cart-empty-state">
                    <div className="cart-empty-icon">
                      <i className="ph ph-shopping-cart-simple"></i>
                    </div>
                    <h4>Giỏ hàng đang trống</h4>
                    <p>
                      Khóa học bạn thêm ở trang đăng ký sẽ xuất hiện tại đây để
                      chuẩn bị thanh toán.
                    </p>
                    <button
                      type="button"
                      className="btn-cart-secondary"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate("/courses");
                      }}
                    >
                      Khám phá khóa học
                    </button>
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Tạm tính học phí</span>
                    <strong>{cartTotal.toLocaleString("vi-VN")} đ</strong>
                  </div>
                  <button
                    className="btn-checkout"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate("/payments");
                    }}
                  >
                    Thanh toán
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
