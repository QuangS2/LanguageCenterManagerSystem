import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Sidebar from "../Sidebar";
import apiClient from "../../service/apiClient";

// =======================
// MOCK navigate
// =======================
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// =======================
// MOCK apiClient
// =======================
vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

// =======================
// MOCK ROLES
// =======================
vi.mock("../../data/mockData", () => ({
  ROLES: {
    admin: {
      initials: "A",
      roleName: "Admin",
      nav: [
        {
          section: "Admin",
          items: [
            { id: "a-dashboard", label: "Dashboard", icon: "ph-house" },
            { id: "a-courses", label: "Courses", icon: "ph-book" },
          ],
        },
      ],
    },
    teacher: {
      initials: "T",
      roleName: "Teacher",
      nav: [
        {
          section: "Teacher",
          items: [
            { id: "t-dashboard", label: "Dashboard", icon: "ph-house" },
            { id: "t-attendance", label: "Attendance", icon: "ph-check" },
          ],
        },
      ],
    },
    student: {
      initials: "S",
      roleName: "Student",
      nav: [
        {
          section: "Student",
          items: [
            { id: "s-dashboard", label: "Dashboard", icon: "ph-house" },
            { id: "s-courses", label: "Courses", icon: "ph-book" },
          ],
        },
      ],
    },
  },
}));

// =======================
// TEST
// =======================
describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    apiClient.get.mockResolvedValue({
      data: {
        fullName: "Test User",
        email: "test@gmail.com",
        age: 20,
      },
    });
  });

  // =======================
  // 1. Render theo role
  // =======================
  it("render đúng menu với role admin", async () => {
    render(
      <MemoryRouter>
        <Sidebar role="admin" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
  });

  it("render đúng menu với role teacher", async () => {
    render(
      <MemoryRouter>
        <Sidebar role="teacher" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Attendance")).toBeInTheDocument();
  });

  // =======================
  // 2. Click -> navigate
  // =======================
  it("click dashboard (admin) -> /admindashboard", async () => {
    render(
      <MemoryRouter>
        <Sidebar role="admin" />
      </MemoryRouter>
    );

    const dashboard = await screen.findByText("Dashboard");
    fireEvent.click(dashboard);

    expect(mockNavigate).toHaveBeenCalledWith("/admindashboard");
  });

  it("click courses (admin) -> /admin/courses", async () => {
    render(
      <MemoryRouter>
        <Sidebar role="admin" />
      </MemoryRouter>
    );

    const courses = await screen.findByText("Courses");
    fireEvent.click(courses);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/courses");
  });

  it("click dashboard (student) -> /studentdashboard", async () => {
    render(
      <MemoryRouter>
        <Sidebar role="student" />
      </MemoryRouter>
    );

    const dashboard = await screen.findByText("Dashboard");
    fireEvent.click(dashboard);

    expect(mockNavigate).toHaveBeenCalledWith("/studentdashboard");
  });

  // =======================
  // 3. Active class
  // =======================
  it("dashboard active khi ở /admindashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/admindashboard"]}>
        <Sidebar role="admin" />
      </MemoryRouter>
    );

    const dashboard = await screen.findByText("Dashboard");

    expect(dashboard.closest(".nav-item")).toHaveClass("active");
  });

  it("courses active khi ở /admin/courses", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/courses"]}>
        <Sidebar role="admin" />
      </MemoryRouter>
    );

    const courses = await screen.findByText("Courses");

    expect(courses.closest(".nav-item")).toHaveClass("active");
  });

  // =======================
  // 4. Logout
  // =======================
  it("click logout gọi onLogout", async () => {
    const mockLogout = vi.fn();

    render(
      <MemoryRouter>
        <Sidebar role="admin" onLogout={mockLogout} />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByText("Đăng xuất");
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
  });
});