import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "../AdminDashboardPage";
import apiClient from "../../service/apiClient";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hien loading luc dau", () => {
    apiClient.get.mockResolvedValue({ data: [] });

    render(<AdminDashboardPage />);

    expect(
      screen.getByText(/đang tải bảng điều phối quản trị/i),
    ).toBeInTheDocument();
  });
  it("fallback ve mang rong khi data undefined", async () => {
    apiClient.get.mockResolvedValue({ data: undefined });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(5);
    });
  });
  it("render du lieu va click nut dieu huong", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/courses") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: "Course A",
              tuitionFee: 100000,
              level: "BEGINNER",
            },
          ],
        });
      }
      if (url === "/teachers") {
        return Promise.resolve({
          data: [{ teacherId: 11, userName: "Thay A" }],
        });
      }
      if (url === "/students") {
        return Promise.resolve({ data: [{ id: 21 }] });
      }
      if (url === "/discounts") {
        return Promise.resolve({
          data: [{ id: 31, active: true, name: "Sale", discountPercent: 10 }],
        });
      }
      if (url === "/classes") {
        return Promise.resolve({
          data: [{ classId: 41, status: "ACTIVE", teacher: { teacherId: 11 } }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<AdminDashboardPage />);

    expect(await screen.findByText(/trung tâm điều phối/i)).toBeInTheDocument();

    const btn = screen.getAllByRole("button", { name: /quản lý khóa học/i })[0];
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/courses");
  });

  it("hien loi khi api fail het", async () => {
    apiClient.get.mockRejectedValue(new Error("fail"));

    render(<AdminDashboardPage />);

    expect(
      await screen.findByText(/không thể tải dữ liệu quản trị/i),
    ).toBeInTheDocument();
  });
});
