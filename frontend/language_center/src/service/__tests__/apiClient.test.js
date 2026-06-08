import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  let requestOnFulfilled;
  let requestOnRejected;
  let responseOnFulfilled;
  let responseOnRejected;

  const mockAxios = {
    interceptors: {
      request: {
        use: vi.fn((onFulfilled, onRejected) => {
          requestOnFulfilled = onFulfilled;
          requestOnRejected = onRejected;
        }),
      },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          responseOnFulfilled = onFulfilled;
          responseOnRejected = onRejected;
        }),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
  };

  return {
    mockAxios,
    getRequestOnFulfilled: () => requestOnFulfilled,
    getRequestOnRejected: () => requestOnRejected,
    getResponseOnFulfilled: () => responseOnFulfilled,
    getResponseOnRejected: () => responseOnRejected,
  };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mocks.mockAxios),
  },
}));

import apiClient from "../apiClient";

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Request Interceptor", () => {
    it("should attach Authorization header when token exists", () => {
      localStorage.setItem("token", "test-token-123");

      const config = { headers: {} };
      const result = mocks.getRequestOnFulfilled()(config);

      expect(result.headers.Authorization).toBe("Bearer test-token-123");
    });

    it("should not attach header when token is missing", () => {
      localStorage.clear();

      const config = { headers: {} };
      const result = mocks.getRequestOnFulfilled()(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("Response Interceptor - Success", () => {
    it("should pass through successful response (2xx)", () => {
      const response = { status: 200, data: { message: "OK" } };

      expect(mocks.getResponseOnFulfilled()(response)).toEqual(response);
    });
  });

  describe("Response Interceptor - 401 Unauthorized", () => {
    it("should remove token and user from localStorage on 401", async () => {
      localStorage.setItem("token", "test-token");
      localStorage.setItem("user", "test-user-data");
      vi.spyOn(console, "error").mockImplementation(() => {});

      const error = {
        response: { status: 401, data: { message: "Unauthorized" } },
      };

      await expect(mocks.getResponseOnRejected()(error)).rejects.toEqual(error);

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("should redirect to login on 401", async () => {
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { href: "" },
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      const error = {
        response: { status: 401 },
      };

      await expect(mocks.getResponseOnRejected()(error)).rejects.toEqual(error);
      expect(window.location.href).toBe("/login");

      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    });

    it("should reject promise on 401", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const error = {
        response: { status: 401 },
      };

      await expect(mocks.getResponseOnRejected()(error)).rejects.toEqual(error);
    });
  });

  describe("Response Interceptor - Other Errors", () => {
    it("should reject on 5xx error without clearing storage", async () => {
      localStorage.setItem("token", "test-token");

      const error = {
        response: { status: 500 },
      };

      await expect(mocks.getResponseOnRejected()(error)).rejects.toEqual(error);
      expect(localStorage.getItem("token")).toBe("test-token");
    });
  });

  describe("API Requests", () => {
    it("should make GET request with correct URL", async () => {
      mocks.mockAxios.get.mockResolvedValue({ data: { message: "success" } });

      await apiClient.get("/test");

      expect(mocks.mockAxios.get).toHaveBeenCalledWith("/test");
    });

    it("should make POST request with data", async () => {
      mocks.mockAxios.post.mockResolvedValue({ data: { token: "xyz" } });

      await apiClient.post("/auth", { username: "test", password: "123" });

      expect(mocks.mockAxios.post).toHaveBeenCalledWith("/auth", {
        username: "test",
        password: "123",
      });
    });
  });
});
