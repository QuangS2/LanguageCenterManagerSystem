import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "../AppContext";

function Consumer() {
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    cartOriginalTotal,
    searchQuery,
    setSearchQuery,
    isCartOpen,
    setIsCartOpen,
    isNotifOpen,
    setIsNotifOpen,
  } = useApp();

  return (
    <div>
      {/* Cart Display */}
      <div data-testid="cart-count">{cart.length}</div>
      <div data-testid="cart-total">{cartTotal}</div>
      <div data-testid="cart-original-total">{cartOriginalTotal}</div>
      <div data-testid="search-query">{searchQuery}</div>
      <div data-testid="is-cart-open">{isCartOpen ? "open" : "closed"}</div>
      <div data-testid="is-notif-open">{isNotifOpen ? "open" : "closed"}</div>

      {/* Action Buttons */}
      <button onClick={() => addToCart({ id: 1, tuitionFee: 100 })}>
        Add Course 1
      </button>
      <button onClick={() => addToCart({ id: 2, tuitionFee: 250 })}>
        Add Course 2
      </button>
      <button
        onClick={() =>
          addToCart({ id: 3, tuitionFee: 150, originalPrice: 200 })
        }
      >
        Add Course 3 (with originalPrice)
      </button>
      <button onClick={() => removeFromCart(1)}>Remove Course 1</button>
      <button onClick={clearCart}>Clear Cart</button>
      <button onClick={() => setSearchQuery("react")}>Set Search Query</button>
      <button onClick={() => setIsCartOpen(!isCartOpen)}>Toggle Cart</button>
      <button onClick={() => setIsNotifOpen(!isNotifOpen)}>Toggle Notif</button>
    </div>
  );
}
describe("AppContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  describe("provider and hook", () => {
    it("should provide context and hook work", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );
      expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
      expect(screen.getByTestId("cart-total")).toHaveTextContent("0");
    });
  });
  describe("add and remove cart", () => {
    it("should add course to cart", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));
      expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
      expect(screen.getByTestId("cart-total")).toHaveTextContent("100");
    });
    it("should remove course from cart", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));
      fireEvent.click(screen.getByRole("button", { name: /add course 2/i }));

      expect(screen.getByTestId("cart-count")).toHaveTextContent("2");

      fireEvent.click(screen.getByRole("button", { name: /remove course 1/i }));

      expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
      expect(screen.getByTestId("cart-total")).toHaveTextContent("250");
    });
    it("should prevent duplicate add with alert", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));
      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));

      expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
      expect(alertSpy).toHaveBeenCalled();
    });
  });
  describe("Cart Calculations", () => {
    it("should calculate cart total correctly", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));
      fireEvent.click(screen.getByRole("button", { name: /add course 2/i }));

      expect(screen.getByTestId("cart-total")).toHaveTextContent("350");
    });

    it("should calculate original total with originalPrice fallback", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 3/i }));
      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));

      expect(screen.getByTestId("cart-original-total")).toHaveTextContent(
        "300",
      );
    });
  });
  describe("Clear Cart", () => {
    it("should clear all courses from cart", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));
      fireEvent.click(screen.getByRole("button", { name: /add course 2/i }));

      expect(screen.getByTestId("cart-count")).toHaveTextContent("2");

      fireEvent.click(screen.getByRole("button", { name: /clear cart/i }));

      expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
      expect(screen.getByTestId("cart-total")).toHaveTextContent("0");
    });
  });
  describe("Search & Drawer State", () => {
    it("should update search query", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(
        screen.getByRole("button", { name: /set search query/i }),
      );

      expect(screen.getByTestId("search-query")).toHaveTextContent("react");
    });

    it("should toggle cart drawer", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      expect(screen.getByTestId("is-cart-open")).toHaveTextContent("closed");

      fireEvent.click(screen.getByRole("button", { name: /toggle cart/i }));
      expect(screen.getByTestId("is-cart-open")).toHaveTextContent("open");

      fireEvent.click(screen.getByRole("button", { name: /toggle cart/i }));
      expect(screen.getByTestId("is-cart-open")).toHaveTextContent("closed");
    });

    it("should toggle notification drawer", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      expect(screen.getByTestId("is-notif-open")).toHaveTextContent("closed");

      fireEvent.click(screen.getByRole("button", { name: /toggle notif/i }));
      expect(screen.getByTestId("is-notif-open")).toHaveTextContent("open");
    });
  });
  describe("Edge Cases", () => {
    it("should handle remove when id does not exist", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));

      fireEvent.click(screen.getByRole("button", { name: /remove course 1/i }));

      fireEvent.click(screen.getByRole("button", { name: /remove course 1/i }));

      expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
    });

    it("should handle mixed pricing (originalPrice and tuitionFee)", () => {
      render(
        <AppProvider>
          <Consumer />
        </AppProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: /add course 3/i }));
      fireEvent.click(screen.getByRole("button", { name: /add course 1/i }));

      expect(screen.getByTestId("cart-total")).toHaveTextContent("250");
      expect(screen.getByTestId("cart-original-total")).toHaveTextContent(
        "300",
      );
    });
  });
});
