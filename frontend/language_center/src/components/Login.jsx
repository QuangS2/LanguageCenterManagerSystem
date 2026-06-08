import React, { useState } from "react";
import apiClient from "../service/apiClient";

export default function Login({ onLoginSuccess }) {
  const [activeRole, setActiveRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        username: username,
        password: password,
      });

      localStorage.setItem(
        "token",
        response.data.token || response.data.accessToken,
      );
      const profileResponse = await apiClient.get("/me/profile");
      const actualRole =
        profileResponse.data?.profileType ||
        profileResponse.data?.roles?.[0] ||
        activeRole;
      onLoginSuccess(actualRole);
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-screen" className="mimo-theme">
      <div className="top-nav-logo">
        <div className="brand-icon">
          <i className="ph ph-book-open-text"></i>
        </div>
        <div className="brand-name">LinguaHub</div>
      </div>

      <div className="login-container">
        <div className="login-left-content">
          <div className="login-headline">
            <h1>Quản lý trung tâm ngoại ngữ thông minh</h1>
          </div>

          <div className="login-form-area">
            <div className="role-selector dark-mode">
              <div
                className={`role-btn ${activeRole === "student" ? "active" : ""}`}
                onClick={() => setActiveRole("student")}
              >
                <i className="ph ph-student"></i>
                <span className="role-label">Học viên</span>
              </div>
              <div
                className={`role-btn ${activeRole === "teacher" ? "active" : ""}`}
                onClick={() => setActiveRole("teacher")}
              >
                <i className="ph ph-chalkboard-teacher"></i>
                <span className="role-label">Giáo viên</span>
              </div>
              <div
                className={`role-btn ${activeRole === "admin" ? "active" : ""}`}
                onClick={() => setActiveRole("admin")}
              >
                <i className="ph ph-user"></i>
                <span className="role-label">Admin</span>
              </div>
            </div>

            {error && (
              <div
                style={{
                  color: "#EF4444",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <i
                  className="ph-fill ph-warning-circle"
                  style={{ marginRight: "6px" }}
                ></i>
                {error}
              </div>
            )}

            <form onSubmit={handleLoginClick}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input glass-input"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input glass-input"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-login"
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>

        <div className="login-illustration">
          <div className="floating-icon main-icon">
            <i className="ph-duotone ph-student"></i>
          </div>
          <div className="floating-icon small-icon-2">
            <i className="ph-fill ph-translate"></i>
          </div>
          <div className="floating-icon small-icon-1">
            <i className="ph-fill ph-calendar-dots"></i>
          </div>
          <div className="floating-icon small-icon-3">
            <i className="ph ph-books"></i>
          </div>
          <div className="floating-icon small-icon-4">
            <i className="ph ph-microsoft-teams-logo"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
