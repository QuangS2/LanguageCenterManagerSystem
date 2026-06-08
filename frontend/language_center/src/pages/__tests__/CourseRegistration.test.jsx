import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import apiClient from "../../service/apiClient";
import CourseRegistration from "../CourseRegistration";

const mockAddToCart = vi.fn();

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../context/AppContext", () => ({
  useApp: () => ({
    addToCart: mockAddToCart,
    searchQuery: "",
    setIsCartOpen: vi.fn(),
  }),
}));

describe("CourseRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    try {
      vi.useRealTimers();
    } catch (e) {}
  });

  it("shows loading state initially", () => {
    apiClient.get.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 500)),
    );

    render(<CourseRegistration />);

    expect(
      screen.getByText(/đang tải danh sách khóa học/i),
    ).toBeInTheDocument();
  });

  it("shows error when api call fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    apiClient.get.mockRejectedValueOnce(new Error("Network"));

    render(<CourseRegistration />);

    expect(
      await screen.findByText(/không thể tải dữ liệu tìm kiếm/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("renders courses and adds selected class to cart", async () => {
    const mockCourses = [
      {
        id: "1",
        name: "Course A",
        tuitionFee: "100000",
        description: "Learn English A",
        level: "Beginner",
      },
      {
        id: "2",
        name: "Course B",
        tuitionFee: "200000",
        description: "Learn English B",
        level: "Intermediate",
      },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url === "/courses") {
        return Promise.resolve({ data: mockCourses });
      }

      if (url === "/courses/1/classes") {
        return Promise.resolve({
          data: [
            {
              classId: 11,
              className: "A1",
              maxStudents: 20,
              enrolledStudents: 5,
              startDate: "2030-01-01T09:00:00",
              endDate: "2030-01-01T11:00:00",
              registrationStart: "2026-01-01T00:00:00",
              registrationEnd: "2026-02-01T00:00:00",
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(<CourseRegistration />);

    expect(await screen.findByText("Course A")).toBeInTheDocument();
    expect(screen.getByText("Course B")).toBeInTheDocument();

    const addButtons = screen.getAllByTitle("Chọn lớp để đăng ký");
    fireEvent.click(addButtons[1]);

    expect(await screen.findByText(/Chọn lớp đang mở/i)).toBeInTheDocument();

    const classOption = screen.getByText("A1");
    fireEvent.click(classOption);

    const addClassBtn = screen.getByRole("button", {
      name: /Thêm lớp đã chọn vào giỏ/i,
    });
    fireEvent.click(addClassBtn);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          courseId: "1",
        })
      );
    });
  });

  it("changes active filter when filter buttons clicked", async () => {
    const mockCourses = [
      {
        id: "1",
        name: "Course A",
        tuitionFee: "100000",
        description: "Learn English A",
        level: "Beginner",
      },
    ];

    apiClient.get.mockResolvedValueOnce({ data: mockCourses });

    render(<CourseRegistration />);

    expect(await screen.findByText("Course A")).toBeInTheDocument();

    const ratingBtn = screen.getByText(/Rating cao nhất/i);
    fireEvent.click(ratingBtn);

    expect(ratingBtn.closest(".filter-pill")).toHaveClass("active");
  });
});
