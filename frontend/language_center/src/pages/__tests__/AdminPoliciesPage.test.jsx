import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPoliciesPage from "../AdminPoliciesPage";
import apiClient from "../../service/apiClient";

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("AdminPoliciesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render danh sach chinh sach", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/discounts") {
        return Promise.resolve({
          data: [{ id: 1, name: "Sale 10", discountPercent: 10, active: true }],
        });
      }
      if (url === "/courses") {
        return Promise.resolve({
          data: [{ id: 9, name: "Course A", tuitionFee: 100000 }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<AdminPoliciesPage />);

    expect(
      await screen.findByText(/Học phí & chính sách/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Sale 10")).toBeInTheDocument();
  });

  it("tao chinh sach moi", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    apiClient.post.mockResolvedValue({ data: { id: 2 } });

    render(<AdminPoliciesPage />);

    expect(
      await screen.findByText(/Tạo chính sách ưu đãi/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Tên chính sách"), {
      target: { value: "Uu dai" },
    });
    fireEvent.change(screen.getByLabelText("Phần trăm giảm"), {
      target: { value: "15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo chính sách/i }));

    expect(await apiClient.post).toHaveBeenCalledWith("/discounts", {
      name: "Uu dai",
      discountPercent: 15,
      description: "",
      active: true,
    });

    expect(
      await screen.findByText(/Đã tạo chính sách ưu đãi mới/i),
    ).toBeInTheDocument();
  });

  it("khong xoa khi nguoi dung huy confirm", async () => {
    window.confirm = vi.fn(() => false);

    apiClient.get.mockImplementation((url) => {
      if (url === "/discounts") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: "Sale 10",
              discountPercent: 10,
              active: true,
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(<AdminPoliciesPage />);

    expect(await screen.findByText("Sale 10")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /xóa/i })[0]);

    expect(apiClient.delete).not.toHaveBeenCalled();
  });
  it("Xoa chinh sach thanh cong", async () => {
    window.confirm = vi.fn(() => true);

    apiClient.get.mockImplementation((url) => {
      if (url === "/discounts") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: "Sale 10",
              discountPercent: 10,
              active: true,
            },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    apiClient.delete.mockResolvedValue({});

    render(<AdminPoliciesPage />);

    expect(await screen.findByText("Sale 10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Xóa$/i }));

    expect(apiClient.delete).toHaveBeenCalledTimes(1);
    expect(apiClient.delete).toHaveBeenCalledWith("/discounts/1");
  });
  it("hien loi khi xoa that bai", async () => {
    window.confirm = vi.fn(() => true);

    apiClient.get.mockImplementation((url) => {
      if (url === "/discounts") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: "Sale 10",
              discountPercent: 10,
              active: true,
            },
          ],
        });
      }

      if (url === "/courses") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    apiClient.delete.mockRejectedValue(new Error("Delete failed"));

    render(<AdminPoliciesPage />);

    expect(await screen.findByText("Sale 10")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /^xóa$/i })[0]);

    expect(apiClient.delete).toHaveBeenCalledWith("/discounts/1");

    expect(
      await screen.findByText(/không thể xóa chính sách này/i),
    ).toBeInTheDocument();
  });
});
