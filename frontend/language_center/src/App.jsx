import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./layouts/MainLayout";
import Login from "./components/Login";
import StudentDashboard from "./pages/StudentDashBoard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAttendancePage from "./pages/TeacherAttendancePage";
import TeacherGradesPage from "./pages/TeacherGradesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminClassesPage from "./pages/AdminClassesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminPoliciesPage from "./pages/AdminPoliciesPage";
import CourseRegistration from "./pages/CourseRegistration";
import PaymentPage from "./pages/PaymentPage";
import "./App.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      setUserRole(savedRole || "student");
    }
    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth)
    return <div className="loading-screen">Đang kết nối...</div>;

  const getDefaultRoute = () => {
    if (userRole === "teacher" || userRole === "TEACHER")
      return "teacherdashboard";
    if (userRole === "admin" || userRole === "ADMIN") return "admindashboard";
    return "studentdashboard";
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              !isLoggedIn ? (
                <Login
                  onLoginSuccess={(role) => {
                    setIsLoggedIn(true);
                    setUserRole(role);
                    localStorage.setItem("role", role);
                  }}
                />
              ) : (
                <Navigate to={`/${getDefaultRoute()}`} />
              )
            }
          />
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <MainLayout
                  role={userRole}
                  onLogout={() => {
                    setIsLoggedIn(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                  }}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="studentdashboard" element={<StudentDashboard />} />
            <Route path="teacherdashboard" element={<TeacherDashboard />} />
            <Route
              path="teacher/attendance"
              element={<TeacherAttendancePage />}
            />
            <Route path="teacher/grades" element={<TeacherGradesPage />} />
            <Route path="admindashboard" element={<AdminDashboardPage />} />
            <Route path="admin/courses" element={<AdminCoursesPage />} />
            <Route path="admin/classes" element={<AdminClassesPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/policies" element={<AdminPoliciesPage />} />
            <Route
              path="Admin/courses"
              element={<Navigate to="/admin/courses" replace />}
            />
            <Route
              path="Admin/classes"
              element={<Navigate to="/admin/classes" replace />}
            />
            <Route
              path="Admin/users"
              element={<Navigate to="/admin/users" replace />}
            />
            <Route
              path="Admin/policies"
              element={<Navigate to="/admin/policies" replace />}
            />
            <Route path="courses" element={<CourseRegistration />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route index element={<Navigate to={getDefaultRoute()} />} />
            <Route
              path="*"
              element={<Navigate to={`/${getDefaultRoute()}`} replace />}
            />
          </Route>
          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? `/${getDefaultRoute()}` : "/login"}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
