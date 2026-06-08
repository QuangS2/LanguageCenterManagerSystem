import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminClassesPage from "../AdminClassesPage";
import apiClient from "../../service/apiClient";
import { waitFor } from '@testing-library/react';

vi.mock("../../service/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("AdminClassesPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T10:00:00"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the next class session based on the current time", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/classes") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              className: "Lop A1",
              course: { id: 10, name: "English Foundation" },
              teacher: { teacherId: 100, user: { fullname: "Nguyen Van A" } },
              enrolledStudents: 12,
              maxStudents: 20,
              startDate: "2026-05-04",
              endDate: "2026-07-27",
            },
          ],
        });
      }

      if (url === "/courses") {
        return Promise.resolve({
          data: [{ id: 10, name: "English Foundation" }],
        });
      }

      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 100,
              user: { fullname: "Nguyen Van A" },
            },
          ],
        });
      }

      if (url === "/schedules") {
        return Promise.resolve({
          data: [
            {
              classId: 1,
              lessonDate: "2026-05-04",
              startTime: "08:00:00",
            },
            {
              classId: 1,
              lessonDate: "2026-05-20",
              startTime: "14:30:00",
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(<AdminClassesPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("Lop A1")).toBeInTheDocument();

    const nextSessionText = screen.getByText(/Buổi tới:/i);
    expect(nextSessionText.textContent).toContain("20/5/2026");
    expect(nextSessionText.textContent).toContain("14:30");
    expect(nextSessionText.textContent).not.toContain("Invalid Date");
  });

  it("shows every saved schedule row in the editor", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/classes") {
        return Promise.resolve({
          data: [
            {
              id: 1,
              className: "Lop A1",
              course: { id: 10, name: "English Foundation" },
              teacher: { teacherId: 100, user: { fullname: "Nguyen Van A" } },
              enrolledStudents: 12,
              maxStudents: 20,
              startDate: "2026-05-04",
              endDate: "2026-07-27",
            },
          ],
        });
      }

      if (url === "/courses") {
        return Promise.resolve({
          data: [{ id: 10, name: "English Foundation" }],
        });
      }

      if (url === "/teachers") {
        return Promise.resolve({
          data: [
            {
              teacherId: 100,
              user: { fullname: "Nguyen Van A" },
            },
          ],
        });
      }

      if (url === "/schedules") {
        return Promise.resolve({
          data: [
            {
              classId: 1,
              lessonDate: "2026-06-01",
              startTime: "08:00:00",
            },
            {
              classId: 1,
              lessonDate: "2026-06-08",
              startTime: "08:00:00",
            },
            {
              classId: 1,
              lessonDate: "2026-06-15",
              startTime: "08:00:00",
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    const { container } = render(<AdminClassesPage />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await screen.getByRole("button", { name: /Sửa/i }).click();
    });

    expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Thứ 2")).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="date"]').length).toBe(2);
  });
});
