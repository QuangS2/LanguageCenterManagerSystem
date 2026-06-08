import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders brand and contact information", () => {
    render(<Footer />);

    expect(screen.getByText("LinguaHub")).toBeInTheDocument();
    expect(screen.getByText(/support@linguahub.vn/i)).toBeInTheDocument();
    expect(screen.getByText(/0123 456 789/i)).toBeInTheDocument();
  });

  it("shows current year in copyright line", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear} LinguaHub`, "i")),
    ).toBeInTheDocument();
  });
});
