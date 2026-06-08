import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeacherAttendancePage from "../TeacherAttendancePage";
import apiClient from "../../service/apiClient";

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("TeacherAttendancePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTeacherAttendanceApi = ({
    classes = [
      {
        classId: 1,
        className: "Lop A",
        course: { courseName: "English" },
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
    students = [{ id: 100, fullName: "Hoc Vien A", email: "hv@mail.com" }],
    attendances = [],
    rejectBase = false,
    rejectStudents = false,
    rejectAttendances = false,
  } = {}) => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/me/classes") {
        if (rejectBase) return Promise.reject(new Error("Classes failed"));
        return Promise.resolve({ data: classes });
      }
      if (url === "/me/schedules") {
        if (rejectBase) return Promise.reject(new Error("Schedules failed"));
        return Promise.resolve({ data: schedules });
      }
      if (url === "/classes/1/students") {
        if (rejectStudents) return Promise.reject(new Error("Students failed"));
        return Promise.resolve({ data: students });
      }
      if (url === "/attendances/schedule/10") {
        if (rejectAttendances) {
          return Promise.reject(new Error("Attendance failed"));
        }
        return Promise.resolve({ data: attendances });
      }

      return Promise.resolve({ data: [] });
    });
  };

  it("load danh sach va diem danh", async () => {
    mockTeacherAttendanceApi();

    apiClient.post.mockResolvedValue({
      data: { attendanceId: 1, studentId: 100, status: "PRESENT" },
    });

    render(<TeacherAttendancePage />);

    expect(await screen.findAllByText("Hoc Vien A")).toHaveLength(1);

    const btn = screen.getByRole("button", { name: /có mặt/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(/Đã cập nhật điểm danh/i),
    ).toBeInTheDocument();
  });

  it("hien loi khi khong the tai du lieu diem danh", async () => {
    mockTeacherAttendanceApi({ rejectBase: true });

    render(<TeacherAttendancePage />);

    expect(
      await screen.findByText(/Không thể tải dữ liệu điểm danh lúc này/i),
    ).toBeInTheDocument();
  });

  it("cap nhat bang PUT khi hoc vien da co attendance", async () => {
    mockTeacherAttendanceApi({
      attendances: [
        {
          attendanceId: 99,
          studentId: 100,
          status: "LATE",
        },
      ],
    });

    apiClient.put.mockResolvedValue({
      data: {
        attendanceId: 99,
        studentId: 100,
        scheduleId: 10,
        status: "PRESENT",
      },
    });

    render(<TeacherAttendancePage />);

    expect(await screen.findByText("Hoc Vien A")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /đi trễ/i })).toHaveClass(
        "active",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /có mặt/i }));

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith("/attendances/99", {
        studentId: 100,
        scheduleId: 10,
        status: "PRESENT",
      });
    });
  });

  it("hien empty state khi khong tai duoc hoc vien", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockTeacherAttendanceApi({ rejectStudents: true, rejectAttendances: true });

    render(<TeacherAttendancePage />);

    expect(
      await screen.findByText(
        /Lớp này hiện chưa có học viên hoặc bạn chưa được phân buổi dạy tương ứng/i,
      ),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("hien loi khi luu diem danh that bai", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockTeacherAttendanceApi();
    apiClient.post.mockRejectedValue(new Error("Save failed"));

    render(<TeacherAttendancePage />);

    expect(await screen.findByText("Hoc Vien A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /vắng/i }));

    expect(
      await screen.findByText(/Không thể lưu điểm danh cho học viên này/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
