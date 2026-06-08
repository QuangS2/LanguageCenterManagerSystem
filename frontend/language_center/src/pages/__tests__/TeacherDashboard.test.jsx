import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeacherDashboard from "../TeacherDashboard";
import apiClient from "../../service/apiClient";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@fullcalendar/react", () => ({
  default: () => <div data-testid="full-calendar"></div>,
}));
vi.mock("@fullcalendar/daygrid", () => ({
  default: {},
}));
vi.mock("@fullcalendar/interaction", () => ({
  default: {},
}));

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("TeacherDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTeacherDashboardApi = ({
    profile = {
      fullName: "Thay A",
      email: "teach@mail.com",
      teacherInfo: { specialization: "IELTS" },
    },
    classes = [
      {
        classId: 1,
        className: "Lop A",
        course: { courseName: "English" },
        enrolledStudents: 20,
        maxStudents: 30,
        status: "ACTIVE",
        startDate: "2024-01-01",
      },
    ],
    schedules = [
      {
        scheduleId: 10,
        classId: 1,
        lessonDate: "2099-01-10",
        startTime: "09:00:00",
        endTime: "10:00:00",
        roomNumber: "A1",
      },
    ],
    failProfile = false,
    rejectClasses = false,
    rejectSchedules = false,
  } = {}) => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/me/profile") {
        if (failProfile) {
          return Promise.reject(new Error("Profile failed"));
        }
        return Promise.resolve({ data: profile });
      }

      if (url === "/me/classes") {
        if (rejectClasses) {
          return Promise.reject(new Error("Classes failed"));
        }
        return Promise.resolve({ data: classes });
      }

      if (url === "/me/schedules") {
        if (rejectSchedules) {
          return Promise.reject(new Error("Schedules failed"));
        }
        return Promise.resolve({ data: schedules });
      }

      return Promise.resolve({ data: [] });
    });
  };

  it("render man hinh giao vien", async () => {
    mockTeacherDashboardApi();

    render(<TeacherDashboard />);

    expect(
      await screen.findByText(/Không gian Giảng viên/i),
    ).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /nhập điểm học viên/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/teacher/grades");
  });

  it("hien loi khi khong the tai profile", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockTeacherDashboardApi({ failProfile: true });

    render(<TeacherDashboard />);

    expect(
      await screen.findByText(/Không thể tải dữ liệu dashboard lúc này/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("hien cac trang thai lop va fallback du lieu", async () => {
    mockTeacherDashboardApi({
      profile: {
        fullName: "Thay B",
        email: "teacher-b@mail.com",
        teacherInfo: null,
      },
      classes: [
        {
          classId: 1,
          className: "Lop ACTIVE",
          courseName: "English",
          enrolledStudents: 18,
          maxStudents: 25,
          status: "ACTIVE",
          startDate: null,
        },
        {
          classId: 2,
          className: "Lop DONE",
          courseName: "French",
          enrolledStudents: 20,
          maxStudents: 20,
          status: "COMPLETED",
          startDate: "invalid-date",
        },
        {
          classId: 3,
          className: "Lop PENDING",
          courseName: "German",
          enrolledStudents: 0,
          maxStudents: 15,
          status: "",
          startDate: "2024-02-02",
        },
      ],
      schedules: [
        {
          scheduleId: 21,
          classId: 1,
          lessonDate: "2099-03-02 00:00:00",
          startTime: "10:30:00",
          endTime: "12:00:00",
          roomNumber: "B1",
        },
        {
          scheduleId: 22,
          classId: 2,
          lessonDate: "2099-03-03T00:00:00",
          startTime: "19:00:00",
          endTime: "20:30:00",
          roomNumber: "B2",
        },
      ],
    });

    render(<TeacherDashboard />);

    expect(await screen.findByText("Lop ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("Lop DONE")).toBeInTheDocument();
    expect(screen.getByText("Lop PENDING")).toBeInTheDocument();

    expect(screen.getByText("Đang diễn ra")).toBeInTheDocument();
    expect(screen.getByText("Đã kết thúc")).toBeInTheDocument();
    expect(screen.getByText("Đang xử lý")).toBeInTheDocument();

    expect(screen.getAllByText(/Chưa cập nhật/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Đang cập nhật")).toBeInTheDocument();
  });

  it("van render duoc khi classes hoac schedules bi reject", async () => {
    mockTeacherDashboardApi({
      rejectClasses: true,
      rejectSchedules: true,
    });

    render(<TeacherDashboard />);

    expect(
      await screen.findByText(/Không gian Giảng viên/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hiện chưa có lớp học nào được gán cho bạn/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn không có ca dạy nào vào ngày/i),
    ).toBeInTheDocument();

    const attendanceBtn = screen.getByRole("button", { name: /điểm danh/i });
    fireEvent.click(attendanceBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/teacher/attendance");
  });
});
