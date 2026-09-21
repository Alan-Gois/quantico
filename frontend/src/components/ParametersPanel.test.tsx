import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ParametersPanel from "./ParametersPanel";

describe("ParametersPanel", () => {
  const mockParameters = [
    {
      key: "distance_km",
      label: "Distancia",
      min: 0,
      max: 100,
      step: 1,
      unit: "km",
    },
    {
      key: "error_rate",
      label: "Taxa de Erro",
      min: 0,
      max: 0.3,
      step: 0.01,
      unit: "%",
    },
  ];

  const mockValues = {
    distance_km: 50,
    error_rate: 0.01,
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders panel with title", () => {
    render(
      <ParametersPanel
        title="Parametros de Teste"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Parametros de Teste")).toBeInTheDocument();
  });

  it("renders all parameter inputs", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Distancia")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Erro")).toBeInTheDocument();
  });

  it("calls onChange when parameter is changed", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
      />
    );

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "75" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("renders simulate button", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
        onSimulate={jest.fn()}
      />
    );

    expect(screen.getByText("Simular")).toBeInTheDocument();
  });

  it("calls onSimulate when button is clicked", () => {
    const mockOnSimulate = jest.fn();
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
        onSimulate={mockOnSimulate}
      />
    );

    const button = screen.getByText("Simular");
    fireEvent.click(button);

    expect(mockOnSimulate).toHaveBeenCalled();
  });

  it("disables simulate button when loading", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
        onSimulate={jest.fn()}
        loading={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows loading state text", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
        onSimulate={jest.fn()}
        loading={true}
      />
    );

    expect(screen.getByText("Simulando...")).toBeInTheDocument();
  });

  it("hides simulate button when onSimulate is not provided", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText("Simular")).not.toBeInTheDocument();
  });

  it("displays description text", () => {
    render(
      <ParametersPanel
        title="Parametros"
        parameters={mockParameters}
        values={mockValues}
        onChange={mockOnChange}
      />
    );

    expect(
      screen.getByText(/Ajuste os parametros e clique em Simular/i)
    ).toBeInTheDocument();
  });
});
