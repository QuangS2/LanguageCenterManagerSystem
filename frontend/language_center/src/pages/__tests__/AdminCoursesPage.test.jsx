import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCoursesPage from "../AdminCoursesPage";
import apiClient from "../../service/apiClient";

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("AdminCoursesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render danh sach va loc nhanh", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: "Course A", tuitionFee: 100000, level: "BEGINNER" },
        { id: 2, name: "Course B", tuitionFee: 200000, level: "ADVANCED" },
      ],
    });

    render(<AdminCoursesPage />);

    expect(await screen.findByText("Course A")).toBeInTheDocument();
    expect(screen.getByText("Course B")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      /Tên khóa học, giáo viên, lớp mặc định/i,
    );

    fireEvent.change(searchInput, { target: { value: "Course B" } });

    expect(screen.queryByText("Course A")).not.toBeInTheDocument();
    expect(screen.getByText("Course B")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "zzz" } });
    expect(
      screen.getByText(/Không tìm thấy khóa học phù hợp/i),
    ).toBeInTheDocument();
  });

  it("tao khoa hoc moi", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.post.mockResolvedValue({ data: { id: 100 } });

    render(<AdminCoursesPage />);

    expect(
      await screen.findByText(/Khóa học & chương trình/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Tên khóa học"), {
      target: { value: "Khoa moi" },
    });
    fireEvent.change(screen.getByLabelText("Học phí"), {
      target: { value: "120000" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo khóa học/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/courses", {
        name: "Khoa moi",
        level: "BEGINNER",
        durationWeeks: "",
        duration: "",
        tuitionFee: 120000,
        imageUrl: "",
        description: "",
      });
    });

    expect(await screen.findByText(/đã tạo khóa học mới/i)).toBeInTheDocument();
  });
});
