import React from "react";
import { render, screen } from "@testing-library/react";
import MetricCard from "./MetricCard";

describe("MetricCard Component", () => {
  it("renders title and value", () => {
    render(
      <MetricCard
        title="Key Rate"
        value={1234.56}
        unit="bits/s"
      />
    );

    expect(screen.getByText("Key Rate")).toBeInTheDocument();
    expect(screen.getByText("1234.56")).toBeInTheDocument();
    expect(screen.getByText("bits/s")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <MetricCard
        title="Test Metric"
        value={100}
        description="This is a test description"
      />
    );

    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("applies correct status color classes", () => {
    const { rerender } = render(
      <MetricCard
        title="Test"
        value={100}
        status="success"
      />
    );

    let element = screen.getByText("Test").closest("div");
    expect(element?.parentElement).toHaveClass("bg-green-50");

    rerender(
      <MetricCard
        title="Test"
        value={100}
        status="error"
      />
    );

    element = screen.getByText("Test").closest("div");
    expect(element?.parentElement).toHaveClass("bg-red-50");
  });

  it("renders string and numeric values", () => {
    const { rerender } = render(
      <MetricCard
        title="Status"
        value="Active"
      />
    );

    expect(screen.getByText("Active")).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Count"
        value={42}
      />
    );

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("handles missing unit gracefully", () => {
    const { container } = render(
      <MetricCard
        title="Value"
        value={100}
      />
    );

    expect(container.textContent).toContain("100");
  });
});
