import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeacherGradesPage from "../TeacherGradesPage";
import apiClient from "../../service/apiClient";

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("TeacherGradesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bao loi neu chua nhap diem", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/me/classes") {
        return Promise.resolve({
          data: [
            {
              classId: 1,
              className: "Lop A",
              course: { courseName: "English" },
            },
          ],
        });
      }
      if (url === "/classes/1/students") {
        return Promise.resolve({
          data: [{ id: 10, fullName: "Hoc Vien A", email: "hv@mail.com" }],
        });
      }
      if (url === "/grades/class/1") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(<TeacherGradesPage />);

    expect(await screen.findByText("Hoc Vien A")).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: /lưu điểm/i });
    fireEvent.click(saveBtn);

    expect(
      await screen.findByText(/Vui lòng nhập đủ điểm giữa kỳ và cuối kỳ/i),
    ).toBeInTheDocument();
  });

  it("hien thi loi khi tai danh sach lop that bai", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    apiClient.get.mockImplementation((url) => {
      if (url === "/me/classes") {
        return Promise.reject(new Error("Load failed"));
      }
      return Promise.resolve({ data: [] });
    });

    render(<TeacherGradesPage />);

    expect(
      await screen.findByText(/Không thể tải dữ liệu bảng điểm giáo viên/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("hien thi trang thai va cap nhat diem bang PUT", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/me/classes") {
        return Promise.resolve({
          data: [
            {
              classId: 1,
              className: "Lop A",
              course: { courseName: "English" },
              startDate: "2024-01-05T09:00:00Z",
            },
          ],
        });
      }

      if (url === "/classes/1/students") {
        return Promise.resolve({
          data: [
            { id: 10, fullName: "Hoc Vien A", email: "hv-a@mail.com" },
            { id: 11, fullName: "Hoc Vien B", email: "hv-b@mail.com" },
            { id: 12, fullName: "Hoc Vien C", email: "hv-c@mail.com" },
          ],
        });
      }

      if (url === "/grades/class/1") {
        return Promise.resolve({
          data: [
            {
              gradeId: 21,
              studentId: 10,
              midtermGrade: 6,
              finalGrade: 8,
              comment: "Tot",
              result: "PASS",
            },
            {
              gradeId: 22,
              studentId: 11,
              midtermGrade: 3,
              finalGrade: 4,
              comment: "Can co gang hon",
              result: "FAIL",
            },
            {
              gradeId: 23,
              studentId: 12,
              midtermGrade: "abc",
              finalGrade: 9,
              comment: "Du lieu khong hop le",
              result: "",
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    apiClient.put.mockResolvedValue({
      data: {
        gradeId: 21,
        midtermGrade: 7,
        finalGrade: 9,
        comment: "Cap nhat",
        result: "PASS",
      },
    });

    render(<TeacherGradesPage />);

    expect(await screen.findByText("Hoc Vien A")).toBeInTheDocument();
    expect(screen.getByText("Hoc Vien B")).toBeInTheDocument();
    expect(screen.getByText("Hoc Vien C")).toBeInTheDocument();
    expect(screen.getAllByText("PASS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FAIL").length).toBeGreaterThan(0);
    expect(screen.getByText(/Chưa đủ điểm/i)).toBeInTheDocument();

    const numericInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(numericInputs[0], { target: { value: "7" } });
    fireEvent.change(numericInputs[1], { target: { value: "9" } });

    const saveButtons = screen.getAllByRole("button", { name: /lưu điểm/i });
    fireEvent.click(saveButtons[0]);

    expect(
      await screen.findByText(/Đã lưu điểm cho học viên/i),
    ).toBeInTheDocument();
    expect(apiClient.put).toHaveBeenCalledWith(
      "/grades/21",
      expect.objectContaining({
        studentId: 10,
        classId: 1,
        midtermGrade: 7,
        finalGrade: 9,
        comment: "Tot",
      }),
    );
  });

  it("tao diem moi bang POST khi hoc vien chua co ban ghi", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/me/classes") {
        return Promise.resolve({
          data: [
            {
              classId: 2,
              className: "Lop B",
              course: { courseName: "French" },
              startDate: "2024-02-10T09:00:00Z",
            },
          ],
        });
      }

      if (url === "/classes/2/students") {
        return Promise.resolve({
          data: [{ id: 20, fullName: "Hoc Vien D", email: "hv-d@mail.com" }],
        });
      }

      if (url === "/grades/class/2") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    apiClient.post.mockResolvedValue({
      data: {
        gradeId: 30,
        midtermGrade: 8,
        finalGrade: 7,
        comment: "Moi",
        result: "PASS",
      },
    });

    render(<TeacherGradesPage />);

    expect(await screen.findByText("Hoc Vien D")).toBeInTheDocument();

    const numericInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(numericInputs[0], { target: { value: "8" } });
    fireEvent.change(numericInputs[1], { target: { value: "7" } });

    const saveButtons = screen.getAllByRole("button", { name: /lưu điểm/i });
    fireEvent.click(saveButtons[0]);

    expect(
      await screen.findByText(/Đã lưu điểm cho học viên/i),
    ).toBeInTheDocument();
    expect(apiClient.post).toHaveBeenCalledWith(
      "/grades",
      expect.objectContaining({
        studentId: 20,
        classId: 2,
        midtermGrade: 8,
        finalGrade: 7,
        comment: "",
      }),
    );
  });
});
