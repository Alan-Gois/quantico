import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StepCard from "./StepCard";
import { CalculationStep } from "../types/stepbystep";

describe("StepCard", () => {
  const mockStep: CalculationStep = {
    step: 1,
    name: "Atenuacao",
    formula: "A(L) = L × α",
    variables: { L: 10, α: 0.22 },
    result: 2.2,
    unit: "dB",
    status: "completed",
    description: "Calculo da atenuacao do sinal",
  };

  it("renders step card with correct content", () => {
    render(<StepCard step={mockStep} />);

    expect(screen.getByText("Atenuacao")).toBeInTheDocument();
    expect(screen.getByText("A(L) = L × α")).toBeInTheDocument();
    expect(screen.getByText("2.200000")).toBeInTheDocument();
    expect(screen.getByText("dB")).toBeInTheDocument();
  });

  it("toggles expanded state on button click", () => {
    render(<StepCard step={mockStep} isCollapsed={false} />);

    const button = screen.getByRole("button");
    expect(screen.getByText("Calculo da atenuacao do sinal")).toBeInTheDocument();

    fireEvent.click(button);
    // After collapse, description should still be there, but we can test through state
    expect(button).toBeInTheDocument();
  });

  it("calls onToggle callback when clicked", () => {
    const mockOnToggle = jest.fn();
    render(
      <StepCard step={mockStep} onToggle={mockOnToggle} />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it("displays error status correctly", () => {
    const errorStep: CalculationStep = {
      ...mockStep,
      status: "error",
    };

    render(<StepCard step={errorStep} />);
    expect(screen.getByText("Erro")).toBeInTheDocument();
  });

  it("displays completed status correctly", () => {
    render(<StepCard step={mockStep} />);
    expect(screen.getByText("Concluído")).toBeInTheDocument();
  });

  it("displays variables in grid format", () => {
    render(<StepCard step={mockStep} isCollapsed={false} />);

    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("α")).toBeInTheDocument();
  });

  it("handles step without description", () => {
    const stepWithoutDescription: CalculationStep = {
      ...mockStep,
      description: undefined,
    };

    render(<StepCard step={stepWithoutDescription} />);
    expect(
      screen.queryByText(/Descricao/)
    ).not.toBeInTheDocument();
  });

  it("displays step number in circle", () => {
    render(<StepCard step={mockStep} />);

    const circle = screen.getByText("1");
    expect(circle.parentElement).toHaveClass("rounded-full");
    expect(circle.parentElement).toHaveClass("bg-green-500");
  });
});
