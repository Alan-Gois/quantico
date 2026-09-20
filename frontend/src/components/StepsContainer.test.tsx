import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StepsContainer from "./StepsContainer";
import { CalculationStep } from "../types/stepbystep";

describe("StepsContainer", () => {
  const mockSteps: CalculationStep[] = [
    {
      step: 1,
      name: "Passo 1",
      formula: "F1",
      variables: {},
      result: 1.0,
      unit: "unit1",
      status: "completed",
    },
    {
      step: 2,
      name: "Passo 2",
      formula: "F2",
      variables: {},
      result: 2.0,
      unit: "unit2",
      status: "completed",
    },
    {
      step: 3,
      name: "Passo 3",
      formula: "F3",
      variables: {},
      result: 3.0,
      unit: "unit3",
      status: "completed",
    },
  ];

  it("renders all steps", () => {
    render(<StepsContainer steps={mockSteps} />);

    expect(screen.getByText("Passo 1")).toBeInTheDocument();
    expect(screen.getByText("Passo 2")).toBeInTheDocument();
    expect(screen.getByText("Passo 3")).toBeInTheDocument();
  });

  it("displays step count", () => {
    render(<StepsContainer steps={mockSteps} />);

    expect(screen.getByText(/Passos de Calculo \(3\)/)).toBeInTheDocument();
  });

  it("handles empty steps array", () => {
    render(<StepsContainer steps={[]} />);

    expect(
      screen.getByText("Nenhum passo disponivel")
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<StepsContainer steps={[]} loading={true} />);

    const placeholders = screen.getAllByRole("generic");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("shows error state", () => {
    const errorMessage = "Erro ao carregar passos";
    render(
      <StepsContainer steps={[]} error={errorMessage} />
    );

    expect(screen.getAllByText("Erro ao carregar passos")).toHaveLength(2);
  });

  it("toggles all steps expand/collapse", async () => {
    const manySteps = Array.from({ length: 5 }, (_, i) => ({
      step: i + 1,
      name: `Passo ${i + 1}`,
      formula: `F${i + 1}`,
      variables: {},
      result: i + 1.0,
      unit: `unit${i + 1}`,
      status: "completed" as const,
    }));
    render(<StepsContainer steps={manySteps} />);

    const toggleButton = screen.getByRole("button", { name: /Expandir Todos|Recolher Todos/ });
    expect(toggleButton).toHaveTextContent("Expandir Todos");

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toHaveTextContent("Recolher Todos");
    });
  });

  it("expands first few steps by default when count is 3 or less", () => {
    render(<StepsContainer steps={mockSteps} />);

    // When steps <= 3, they should be expanded by default
    expect(screen.getByText("F1")).toBeInTheDocument();
    expect(screen.getByText("F2")).toBeInTheDocument();
    expect(screen.getByText("F3")).toBeInTheDocument();
  });

  it("displays correct step count when has multiple steps", () => {
    const manySteps = Array.from({ length: 7 }, (_, i) => ({
      step: i + 1,
      name: `Passo ${i + 1}`,
      formula: `F${i + 1}`,
      variables: {},
      result: (i + 1) as number,
      unit: `unit${i + 1}`,
      status: "completed" as const,
    }));

    render(<StepsContainer steps={manySteps} />);

    expect(screen.getByText(/Passos de Calculo \(7\)/)).toBeInTheDocument();
  });

  it("applies cascade animation to steps", () => {
    const { container } = render(<StepsContainer steps={mockSteps} />);

    const stepDivs = container.querySelectorAll("[style*='animation']");
    expect(stepDivs.length).toBe(mockSteps.length);
  });
});
