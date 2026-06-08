import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaymentPage from "../PaymentPage";
import apiClient from "../../service/apiClient";

let mockAppState = {
  cart: [],
  cartTotal: 0,
  cartOriginalTotal: 0,
  clearCart: vi.fn(),
};

vi.mock("../../context/AppContext", () => ({
  useApp: () => mockAppState,
}));

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockPaymentApi = ({
  profile = { fullName: "Test", email: "test@mail.com" },
  payments = [],
  classesByCourseId = {},
  enrollmentId = 101,
  paymentId = 900,
} = {}) => {
  apiClient.get.mockImplementation((url) => {
    if (url === "/me/profile") {
      return Promise.resolve({ data: profile });
    }

    if (url === "/me/payments") {
      return Promise.resolve({ data: payments });
    }

    if (url.startsWith("/courses/")) {
      const courseId = url.split("/")[2];
      return Promise.resolve({ data: classesByCourseId[courseId] || [] });
    }

    return Promise.resolve({ data: [] });
  });

  apiClient.post.mockImplementation((url) => {
    if (url === "/enrollments") {
      return Promise.resolve({ data: { id: enrollmentId } });
    }

    if (url === "/payments") {
      return Promise.resolve({ data: { id: paymentId } });
    }

    if (url === `/payments/${paymentId}/payed`) {
      return Promise.resolve({ data: {} });
    }

    return Promise.resolve({ data: {} });
  });
};

describe("PaymentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppState = {
      cart: [],
      cartTotal: 0,
      cartOriginalTotal: 0,
      clearCart: vi.fn(),
    };
  });

  it("gio trong thi hien thong bao", async () => {
    mockPaymentApi();

    render(<PaymentPage />);

    expect(
      await screen.findByText(/Chưa có học phí trong giỏ thanh toán/i),
    ).toBeInTheDocument();

    const applyBtn = screen.getByRole("button", { name: /áp dụng/i });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/Nhập mã ưu đãi để kiểm tra/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /xác nhận thanh toán/i,
    });
    expect(confirmBtn).toBeDisabled();
  });

  it("bao loi khi chua co email", async () => {
    mockAppState = {
      cart: [
        {
          id: "1",
          name: "Course A",
          tuitionFee: 200000,
          originalPrice: 200000,
          imageUrl: "img.png",
        },
      ],
      cartTotal: 200000,
      cartOriginalTotal: 200000,
      clearCart: vi.fn(),
    };

    mockPaymentApi({
      profile: { fullName: "Test", email: "" },
    });

    render(<PaymentPage />);

    expect(
      await screen.findByText(/Thanh toán học phí rõ ràng/i),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /xác nhận thanh toán/i,
    });
    fireEvent.click(confirmBtn);

    expect(
      await screen.findByText(/Vui lòng nhập email nhận hóa đơn/i),
    ).toBeInTheDocument();
  });

  it("hiển thị 'Chưa cập nhật' khi payment date không tồn tại", async () => {
    mockPaymentApi({
      payments: [
        {
          id: 1,
          amount: 500000,
          date: null,
          method: "VNPay",
          status: "PAID",
        },
      ],
    });

    render(<PaymentPage />);

    expect(await screen.findByText("Chưa cập nhật")).toBeInTheDocument();
  });

  it("ap dung ma uu dai hop le va khong hop le", async () => {
    mockAppState = {
      cart: [
        {
          id: "1",
          name: "Course A",
          tuitionFee: 200000,
          originalPrice: 200000,
          imageUrl: "img.png",
        },
      ],
      cartTotal: 200000,
      cartOriginalTotal: 200000,
      clearCart: vi.fn(),
    };

    mockPaymentApi();

    render(<PaymentPage />);

    await screen.findByText(/Thanh toán học phí rõ ràng/i);

    const applyBtn = screen.getByRole("button", { name: /áp dụng/i });
    const promoInput = screen.getByPlaceholderText(/EARLY5 hoặc LINGUA10/i);

    fireEvent.click(applyBtn);

    expect(screen.getByText(/Nhập mã ưu đãi để kiểm tra/i)).toBeInTheDocument();

    fireEvent.change(promoInput, { target: { value: "wrong" } });
    fireEvent.click(applyBtn);

    expect(
      screen.getByText(/Mã ưu đãi chưa hợp lệ hoặc đã hết hạn/i),
    ).toBeInTheDocument();

    fireEvent.change(promoInput, { target: { value: "EARLY5" } });
    fireEvent.click(applyBtn);

    expect(
      screen.getByText(/Đã áp dụng EARLY5\. Bạn được giảm 5%\./i),
    ).toBeInTheDocument();
  });

  it("hien thi lich su thanh toan voi ngay va trang thai", async () => {
    mockPaymentApi({
      payments: [
        {
          id: 1,
          amount: 500000,
          date: "2024-01-05T09:15:00Z",
          method: "VNPay",
          status: "PAID",
        },
        {
          id: 2,
          amount: 250000,
          date: "2024-01-06T09:15:00Z",
          method: "Bank Transfer",
          status: "pending",
        },
        {
          id: 3,
          amount: 150000,
          date: "2024-01-07T09:15:00Z",
          method: "Cash",
          status: "other",
        },
      ],
    });

    render(<PaymentPage />);

    expect(await screen.findByText(/Đã thanh toán/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang chờ xử lý/i)).toBeInTheDocument();
    expect(screen.getByText(/Chưa xác định/i)).toBeInTheDocument();
    expect(screen.queryByText("Chưa cập nhật")).not.toBeInTheDocument();
  });

  it("thanh toan thanh cong va xoa gio", async () => {
    const clearCart = vi.fn();

    mockAppState = {
      cart: [
        {
          id: "1",
          name: "Course A",
          tuitionFee: 200000,
          originalPrice: 250000,
          imageUrl: "img.png",
          level: "Beginner",
          durationWeeks: 8,
          teacherName: "Teacher A",
          defaultScheduleLabel: "Mon/Wed",
          defaultClassName: "A1",
          defaultRoomNumber: "101",
        },
      ],
      cartTotal: 200000,
      cartOriginalTotal: 250000,
      clearCart,
    };

    mockPaymentApi({
      profile: {
        fullName: "Hoc Vien A",
        email: "hv@mail.com",
        username: "hv01",
        studentInfo: { id: 77 },
      },
      classesByCourseId: {
        1: [
          {
            classId: 31,
            startDate: "2030-01-01T09:00:00Z",
            maxStudents: 30,
            enrolledStudents: 12,
          },
          {
            classId: 32,
            startDate: "2030-01-02T09:00:00Z",
            maxStudents: 30,
            enrolledStudents: 30,
          },
        ],
      },
      enrollmentId: 501,
      paymentId: 900,
    });

    render(<PaymentPage />);

    await screen.findByText(/Thanh toán học phí rõ ràng/i);

    fireEvent.click(screen.getByRole("button", { name: /Ví điện tử/i }));

    fireEvent.click(
      screen.getByRole("button", { name: /xác nhận thanh toán/i }),
    );

    expect(
      await screen.findByText(
        /Thanh toán thành công\. Lớp đã được ghi nhận/i,
      ),
    ).toBeInTheDocument();

    expect(apiClient.get).toHaveBeenCalledWith("/courses/1/classes");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/payments",
      expect.objectContaining({
        studentId: 77,
        enrollmentIds: [501],
        amount: 200000,
        method: "E_WALLET",
        status: "pending",
      }),
    );
    expect(clearCart).toHaveBeenCalled();
  });

  it("bao loi thanh toan khi api tra ve message", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockAppState = {
      cart: [
        {
          id: "1",
          name: "Course A",
          tuitionFee: 200000,
          originalPrice: 200000,
          imageUrl: "img.png",
        },
      ],
      cartTotal: 200000,
      cartOriginalTotal: 200000,
      clearCart: vi.fn(),
    };

    apiClient.get.mockImplementation((url) => {
      if (url === "/me/profile") {
        return Promise.resolve({
          data: {
            fullName: "Hoc Vien A",
            email: "hv@mail.com",
            studentInfo: { id: 77 },
          },
        });
      }

      if (url === "/me/payments") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/courses/1/classes") {
        return Promise.reject({
          response: {
            data: {
              message: "Khong the lay lop hoc",
            },
          },
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(<PaymentPage />);

    await screen.findByText(/Thanh toán học phí rõ ràng/i);

    fireEvent.click(
      screen.getByRole("button", { name: /xác nhận thanh toán/i }),
    );

    expect(
      await screen.findByText(/Khong the lay lop hoc/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("bao loi thanh toan khi api tra ve chi tiet", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockAppState = {
      cart: [
        {
          id: "1",
          name: "Course A",
          tuitionFee: 200000,
          originalPrice: 200000,
          imageUrl: "img.png",
        },
      ],
      cartTotal: 200000,
      cartOriginalTotal: 200000,
      clearCart: vi.fn(),
    };

    apiClient.get.mockImplementation((url) => {
      if (url === "/me/profile") {
        return Promise.resolve({
          data: {
            fullName: "Hoc Vien A",
            email: "hv@mail.com",
            studentInfo: { id: 77 },
          },
        });
      }

      if (url === "/me/payments") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/courses/1/classes") {
        return Promise.reject({
          response: {
            data: {
              details: {
                classId: "Lop hoc dang duoc khoa",
              },
            },
          },
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(<PaymentPage />);

    await screen.findByText(/Thanh toán học phí rõ ràng/i);

    fireEvent.click(
      screen.getByRole("button", { name: /xác nhận thanh toán/i }),
    );

    expect(
      await screen.findByText(/Lop hoc dang duoc khoa/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
