import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentDashBoard from "../StudentDashBoard";
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

describe("StudentDashBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStudentDashboardApi = ({
    profile = {
      fullName: "Hoc Vien A",
      email: "hv@mail.com",
      studentInfo: { phone: "0909" },
    },
    schedules = [
      {
        scheduleId: 1,
        classId: 1,
        lessonDate: "2099-01-05",
        startTime: "09:00:00",
        endTime: "10:00:00",
        roomNumber: "A1",
      },
    ],
    classes = [
      {
        classId: 1,
        className: "Lop A",
        course: { courseName: "English 101" },
        teacher: { teacherName: "Thay A" },
        status: "ACTIVE",
      },
    ],
    grades = [{ classId: 1, gradeId: 11, midtermGrade: 6, finalGrade: 7 }],
    payments = [{ id: 1, status: "PENDING", amount: 200000 }],
    rejectAll = false,
  } = {}) => {
    apiClient.get.mockImplementation((url) => {
      if (rejectAll) {
        return Promise.reject(new Error("API failed"));
      }

      if (url === "/me/profile") {
        return Promise.resolve({ data: profile });
      }
      if (url === "/me/schedules") {
        return Promise.resolve({ data: schedules });
      }
      if (url === "/me/classes") {
        return Promise.resolve({ data: classes });
      }
      if (url === "/me/grades") {
        return Promise.resolve({ data: grades });
      }
      if (url === "/me/payments") {
        return Promise.resolve({ data: payments });
      }

      return Promise.resolve({ data: [] });
    });
  };

  it("hien loading luc dau", () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<StudentDashBoard />);

    expect(
      screen.getByText(/đang tải dashboard học viên/i),
    ).toBeInTheDocument();
  });

  it("render du lieu va bam nut", async () => {
    mockStudentDashboardApi();

    render(<StudentDashBoard />);

    expect(await screen.findByText(/Dashboard học viên/i)).toBeInTheDocument();
    expect(screen.getAllByText("English 101").length).toBeGreaterThan(0);

    const buttons = screen.getAllByRole("button", { name: /mở học phí/i });
    fireEvent.click(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/payments");
  });

  it("hien thi loi khi tat ca api that bai", async () => {
    mockStudentDashboardApi({ rejectAll: true });

    render(<StudentDashBoard />);

    expect(
      await screen.findByText(/Không thể tải dữ liệu dashboard vào lúc này/i),
    ).toBeInTheDocument();
  });

  it("hien fallback trang thai lop diem va hoa don", async () => {
    mockStudentDashboardApi({
      classes: [
        {
          classId: 1,
          className: "Lop ACTIVE",
          course: { courseName: "English 101" },
          teacher: { teacherName: "Thay A" },
          status: "ACTIVE",
        },
        {
          classId: 2,
          className: "Lop DONE",
          course: { courseName: "French" },
          teacher: { teacherName: "Thay B" },
          status: "COMPLETED",
        },
        {
          classId: 3,
          className: "Lop OTHER",
          course: { courseName: "German" },
          teacher: { teacherName: "Thay C" },
          status: "",
        },
      ],
      grades: [
        {
          gradeId: 11,
          classId: 1,
          midtermGrade: 6,
          finalGrade: 8,
          result: "PASS",
          comment: "Tot",
        },
        {
          gradeId: 12,
          classId: 2,
          midtermGrade: 5,
          finalGrade: 4,
          result: "FAIL",
          comment: "Can co gang",
        },
        {
          gradeId: 13,
          classId: 3,
          midtermGrade: 7,
          finalGrade: null,
          result: "",
          comment: "",
        },
      ],
      payments: [{ id: 10, status: "PAID", amount: 500000 }],
      schedules: [
        {
          scheduleId: 1,
          classId: 1,
          lessonDate: "2099-01-05",
          startTime: "20:00:00",
          endTime: "21:00:00",
          roomNumber: "A1",
        },
      ],
    });

    render(<StudentDashBoard />);

    expect((await screen.findAllByText("Lop DONE")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lop OTHER").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Đang học").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Đã kết thúc").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Đang xử lý").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Đạt").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cần cải thiện").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Đang cập nhật").length).toBeGreaterThan(0);

    expect(
      screen.getByText(/Hiện không có hóa đơn nào đang chờ thanh toán/i),
    ).toBeInTheDocument();

    const courseButton = screen.getByRole("button", {
      name: /đăng ký thêm khóa học/i,
    });
    fireEvent.click(courseButton);
    expect(mockNavigate).toHaveBeenCalledWith("/courses");
  });

  it("hien cac empty state khi khong co du lieu hoc tap", async () => {
    mockStudentDashboardApi({
      profile: {
        fullName: "",
        email: "",
        studentInfo: null,
      },
      schedules: [],
      classes: [],
      grades: [],
      payments: [],
    });

    render(<StudentDashBoard />);

    expect(
      (await screen.findAllByText(/Buổi học gần nhất/i)).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/Chưa có buổi học nào để hiển thị/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Chưa có lớp đang học nào để hiển thị/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Điểm số chưa được cập nhật trong hệ thống/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Chưa có chi tiết lớp nào để hiển thị/i),
    ).toBeInTheDocument();
  });
});
