import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "../AdminUsersPage";
import apiClient from "../../service/apiClient";
import { waitFor } from '@testing-library/react';

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));
const getStudentForm = () => {
  const saveBtn = screen.getByRole("button", {
    name: /lưu học viên/i,
  });

  const form = saveBtn.closest("form");

  return within(form);
};
describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/students") {
        return Promise.resolve({
          data: [
            {
              id: 5,
              userId: 20,
              fullName: "Hoc Vien A",
              email: "hva@mail.com",
              age: 18,
              dateOfBirth: "2006-01-01",
              phone: "0123456789",
              address: "HCM",
            },
          ],
        });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 20,
                name: "Hoc Vien A",
                username: "hva",
                email: "hva@mail.com",
                age: 18,
                active: true,
              },
            ],
          },
        });
      }

      if (url === "/classes") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });
    window.confirm = vi.fn();
  });

  it("render du lieu giao vien va cho sua nhanh", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 1,
              userId: 11,
              userName: "GV A",
              specialization: "IELTS",
            },
          ],
        });
      }
      if (url === "/students") {
        return Promise.resolve({
          data: [{ id: 2, userId: 12, fullName: "HV A", email: "hv@mail.com" }],
        });
      }
      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 11,
                name: "Giang Vien A",
                username: "gva",
                email: "gva@mail.com",
                age: 30,
                active: true,
              },
              {
                id: 12,
                name: "Hoc Vien A",
                username: "hva",
                email: "hva@mail.com",
                age: 20,
                active: true,
              },
            ],
          },
        });
      }
      if (url === "/classes") {
        return Promise.resolve({
          data: [{ classId: 100, teacher: { teacherId: 1 } }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<AdminUsersPage />);

    expect(await screen.findByText("GV A")).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button", { name: /sửa/i });
    fireEvent.click(editButtons[0]);

    const nameInput = screen.getByLabelText("Họ và tên");
    expect(nameInput.value).toBe("GV A");
  });
  it("tao giang vien moi thanh cong", async () => {
    apiClient.post.mockImplementation((url) => {
      if (url === "/users") {
        return Promise.resolve({
          data: { id: 99 },
        });
      }

      if (url === "/teachers") {
        return Promise.resolve({
          data: {},
        });
      }
    });

    apiClient.put.mockResolvedValue({ data: {} });

    render(<AdminUsersPage />);

    fireEvent.change(await screen.findByLabelText(/họ và tên/i), {
      target: { value: "Nguyen Van A" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "a@gmail.com" },
    });

    fireEvent.change(screen.getByLabelText(/tuổi/i), {
      target: { value: "30" },
    });

    fireEvent.change(screen.getByLabelText(/chuyên môn/i), {
      target: { value: "IELTS" },
    });

    fireEvent.change(screen.getByLabelText(/tên đăng nhập/i), {
      target: { value: "teacherA" },
    });

    fireEvent.change(screen.getByLabelText(/mật khẩu/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo giảng viên/i }));

    expect(await apiClient.post).toHaveBeenCalledWith("/users", {
      fullname: "Nguyen Van A",
      username: "teacherA",
      password: "123456",
      role: "TEACHER",
    });

    expect(await apiClient.put).toHaveBeenCalledWith("/users/99", {
      fullname: "Nguyen Van A",
      age: 30,
      email: "a@gmail.com",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/teachers", {
      userId: 99,
      specialization: "IELTS",
    });

    expect(
      await screen.findByText(/đã tạo tài khoản giảng viên mới/i),
    ).toBeInTheDocument();
  });
  it("cap nhat giang vien thanh cong", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 1,
              userId: 10,
              userName: "GV A",
              specialization: "Toeic",
            },
          ],
        });
      }

      if (url === "/students") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 10,
                name: "GV A",
                username: "gva",
                email: "gva@mail.com",
                age: 35,
                active: true,
              },
            ],
          },
        });
      }

      if (url === "/classes") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    apiClient.put.mockResolvedValue({ data: {} });

    render(<AdminUsersPage />);

    const editButtons = await screen.findAllByRole("button", {
      name: /sửa/i,
    });

    fireEvent.click(editButtons[0]);

    const fullnameInput = screen.getByLabelText(/họ và tên/i);

    fireEvent.change(fullnameInput, {
      target: { value: "GV Updated" },
    });

    fireEvent.click(screen.getByRole("button", { name: /lưu giảng viên/i }));

    expect(await apiClient.put).toHaveBeenCalledWith("/users/10", {
      fullname: "GV Updated",
      age: 35,
      email: "gva@mail.com",
    });
    expect(await apiClient.put).toHaveBeenCalledWith("/teachers/1", {
      userId: 10,
      specialization: "Toeic",
    });

    expect(
      await screen.findByText(/đã cập nhật hồ sơ giảng viên/i),
    ).toBeInTheDocument();
  });
  it("reset form khi bam lam trong", async () => {
    render(<AdminUsersPage />);

    const fullnameInput = await screen.findByLabelText(/họ và tên/i);

    fireEvent.change(fullnameInput, {
      target: { value: "Test Teacher" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@mail.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /làm trống/i }));

    expect(screen.getByLabelText(/họ và tên/i).value).toBe("");
    expect(screen.getByLabelText(/email/i).value).toBe("");
  });

  it("hien thi loi khi tao giang vien that bai", async () => {
    apiClient.post.mockRejectedValue({
      response: {
        data: {
          message: "Username da ton tai",
        },
      },
    });

    render(<AdminUsersPage />);

    fireEvent.change(await screen.findByLabelText(/họ và tên/i), {
      target: { value: "Teacher Error" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "error@mail.com" },
    });

    fireEvent.change(screen.getByLabelText(/tuổi/i), {
      target: { value: "30" },
    });

    fireEvent.change(screen.getByLabelText(/chuyên môn/i), {
      target: { value: "IELTS" },
    });

    fireEvent.change(screen.getByLabelText(/tên đăng nhập/i), {
      target: { value: "teachererror" },
    });

    fireEvent.change(screen.getByLabelText(/mật khẩu/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo giảng viên/i }));

    expect(await screen.findByText(/username da ton tai/i)).toBeInTheDocument();
  });
  it("disable nut submit khi dang luu", async () => {
    apiClient.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { id: 1 } }), 100),
        ),
    );

    render(<AdminUsersPage />);

    fireEvent.change(await screen.findByLabelText(/họ và tên/i), {
      target: { value: "Teacher Loading" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "loading@mail.com" },
    });

    fireEvent.change(screen.getByLabelText(/tuổi/i), {
      target: { value: "30" },
    });

    fireEvent.change(screen.getByLabelText(/chuyên môn/i), {
      target: { value: "IELTS" },
    });

    fireEvent.change(screen.getByLabelText(/tên đăng nhập/i), {
      target: { value: "loadingteacher" },
    });

    fireEvent.change(screen.getByLabelText(/mật khẩu/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo giảng viên/i }));

    expect(screen.getByRole("button", { name: /đang lưu/i })).toBeDisabled();
  });
  it("cap nhat hoc vien thanh cong", async () => {
    apiClient.put.mockResolvedValue({ data: {} });

    render(<AdminUsersPage />);

    const editButtons = await screen.findAllByRole("button", {
      name: /sửa/i,
    });

    fireEvent.click(editButtons[0]);
    // const saveBtn = screen.getByRole("button", { name: /lưu học viên/i });
    // const form = saveBtn.closest("form");
    // const studentForm = within(form);

    const studentForm = getStudentForm();
    const fullnameInput = studentForm.getByLabelText(/^họ và tên$/i);

    fireEvent.change(fullnameInput, {
      target: { value: "Hoc Vien Updated" },
    });

    fireEvent.change(studentForm.getByLabelText(/email/i), {
      target: { value: "updated@mail.com" },
    });

    fireEvent.change(studentForm.getByLabelText(/tuổi/i), {
      target: { value: "20" },
    });

    fireEvent.change(studentForm.getByLabelText(/ngày sinh/i), {
      target: { value: "2004-10-10" },
    });

    fireEvent.change(studentForm.getByLabelText(/điện thoại/i), {
      target: { value: "0999999999" },
    });

    fireEvent.change(studentForm.getByLabelText(/địa chỉ/i), {
      target: { value: "Can Tho" },
    });

    fireEvent.click(studentForm.getByRole("button", { name: /lưu học viên/i }));

    expect(await apiClient.put).toHaveBeenCalledWith("/users/20", {
      fullname: "Hoc Vien Updated",
      age: 20,
      email: "updated@mail.com",
    });
    expect(apiClient.put).toHaveBeenCalledWith("/students/5", {
      dateOfBirth: "2004-10-10",
      phone: "0999999999",
      address: "Can Tho",
    });

    expect(
      await screen.findByText(/đã cập nhật hồ sơ học viên/i),
    ).toBeInTheDocument();
  });
  it("reset form sau khi cap nhat thanh cong", async () => {
    apiClient.put.mockResolvedValue({ data: {} });

    render(<AdminUsersPage />);

    const editButtons = await screen.findAllByRole("button", {
      name: /sửa/i,
    });

    fireEvent.click(editButtons[0]);
    const studentForm = getStudentForm();
    const fullnameInput = studentForm.getByLabelText(/họ và tên/i);

    fireEvent.change(fullnameInput, {
      target: { value: "Reset Student" },
    });

    fireEvent.click(studentForm.getByRole("button", { name: /lưu học viên/i }));

    expect(await apiClient.put).toHaveBeenCalled();
  });
  it("hien thi loi khi cap nhat hoc vien that bai", async () => {
    apiClient.put.mockRejectedValue({
      response: {
        data: {
          message: "Cap nhat that bai",
        },
      },
    });

    render(<AdminUsersPage />);

    const editButtons = await screen.findAllByRole("button", {
      name: /sửa/i,
    });

    fireEvent.click(editButtons[0]);
    const studentForm = getStudentForm();
    fireEvent.change(studentForm.getByLabelText(/họ và tên/i), {
      target: { value: "Hoc Vien Error" },
    });

    fireEvent.click(studentForm.getByRole("button", { name: /lưu học viên/i }));

    expect(await screen.findByText(/cap nhat that bai/i)).toBeInTheDocument();
  });
  it("disable nut submit khi dang luu hoc vien", async () => {
    apiClient.put.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100)),
    );

    render(<AdminUsersPage />);

    const editButtons = await screen.findAllByRole("button", {
      name: /sửa/i,
    });

    fireEvent.click(editButtons[0]);

    const studentForm = getStudentForm();
    fireEvent.change(studentForm.getByLabelText(/họ và tên/i), {
      target: { value: "Loading Student" },
    });

    fireEvent.click(studentForm.getByRole("button", { name: /lưu học viên/i }));

    expect(
      studentForm.getByRole("button", { name: /đang lưu/i }),
    ).toBeDisabled();
  });
  it("khong submit neu studentForm khong co id", async () => {
    render(<AdminUsersPage />);

    expect(
      screen.queryByRole("button", { name: /lưu học viên/i }),
    ).not.toBeInTheDocument();

    expect(apiClient.put).not.toHaveBeenCalled();
  });
  it("khoa tai khoan thanh cong", async () => {
    window.confirm.mockReturnValue(true);

    apiClient.put.mockResolvedValue({
      data: {},
    });

    render(<AdminUsersPage />);

    const deactivateButton = await screen.findByRole("button", {
      name: /khóa/i,
    });

    fireEvent.click(deactivateButton);

    expect(window.confirm).toHaveBeenCalledWith("Khóa tài khoản này?");

    expect(await apiClient.put).toHaveBeenCalledWith("/users/20/deactivate");

    expect(await screen.findByText(/đã khóa tài khoản/i)).toBeInTheDocument();
  });
  it("khong goi api khi user huy confirm", async () => {
    window.confirm.mockReturnValue(false);

    render(<AdminUsersPage />);

    const deactivateButton = await screen.findByRole("button", {
      name: /khóa/i,
    });

    fireEvent.click(deactivateButton);

    expect(window.confirm).toHaveBeenCalled();

    expect(await apiClient.put).not.toHaveBeenCalledWith(
      "/users/20/deactivate",
    );
  });
  it("hien thi loi khi khoa tai khoan that bai", async () => {
    window.confirm.mockReturnValue(true);

    apiClient.put.mockRejectedValue(new Error("Deactivate failed"));

    render(<AdminUsersPage />);

    const deactivateButton = await screen.findByRole("button", {
      name: /khóa/i,
    });

    fireEvent.click(deactivateButton);

    expect(await apiClient.put).toHaveBeenCalledWith("/users/20/deactivate");
    expect(
      await screen.findByText(/không thể khóa tài khoản này/i),
    ).toBeInTheDocument();
  });
  it("fallback ve mang rong khi api tra ve data null", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({
          data: null,
        });
      }

      if (url === "/students") {
        return Promise.resolve({
          data: null,
        });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: null,
        });
      }

      if (url === "/classes") {
        return Promise.resolve({
          data: null,
        });
      }

      return Promise.resolve({ data: null });
    });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalled();
    });

    expect(screen.queryByText("GV A")).not.toBeInTheDocument();
  });
  it("hien thi fallback Giảng viên khi thieu ten", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 1,
              userId: 11,
              userName: "",
            },
          ],
        });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 11,
                name: "",
                username: "",
                email: "",
                age: null,
                active: true,
              },
            ],
          },
        });
      }

      if (url === "/students") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/classes") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    render(<AdminUsersPage />);

    expect(await screen.findByText("Giảng viên")).toBeInTheDocument();
  });
  it("hien thi fallback Giảng viên khi thieu ten", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 1,
              userId: 11,
              userName: "",
            },
          ],
        });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 11,
                name: "",
                username: "",
                email: "",
                age: null,
                active: true,
              },
            ],
          },
        });
      }

      if (url === "/students") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/classes") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    render(<AdminUsersPage />);

    expect(await screen.findByText("Giảng viên")).toBeInTheDocument();
  });
  it("fallback classCount ve 0 khi khong co lop", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 1,
              userId: 11,
              userName: "GV A",
            },
          ],
        });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 11,
                name: "GV A",
                active: true,
              },
            ],
          },
        });
      }

      if (url === "/classes") {
        return Promise.resolve({
          data: [],
        });
      }

      if (url === "/students") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    render(<AdminUsersPage />);

    expect(await screen.findByText("GV A")).toBeInTheDocument();
  });
  it("fallback Hoc vien khi student khong co ten", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/students") {
        return Promise.resolve({
          data: [
            {
              id: 5,
              userId: 20,
              fullName: "",
            },
          ],
        });
      }

      if (url === "/users") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 20,
                name: "",
                active: true,
              },
            ],
          },
        });
      }

      if (url === "/teachers") {
        return Promise.resolve({ data: [] });
      }

      if (url === "/classes") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    render(<AdminUsersPage />);

    expect(await screen.findByText("Học viên")).toBeInTheDocument();
  });
});
