import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StepByStepDashboard from "./StepByStepDashboard";
import { useStepByStepSimulation } from "../hooks/useStepByStepSimulation";

jest.mock("../hooks/useStepByStepSimulation");

describe("StepByStepDashboard", () => {
  const mockUseStepByStepSimulation = useStepByStepSimulation as jest.MockedFunction<
    typeof useStepByStepSimulation
  >;

  const mockSimulationData = {
    protocol: "BB84",
    distance_km: 10,
    steps: [
      {
        step: 1,
        name: "Passo 1",
        formula: "F1",
        variables: {},
        result: 1.0,
        unit: "unit1",
        status: "completed" as const,
      },
    ],
    final_result: {
      secret_key_rate_bps: 1000000,
      qber_percent: 2.0,
      transmissivity: 0.6,
    },
    execution_time_ms: 1.5,
  };

  beforeEach(() => {
    mockUseStepByStepSimulation.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      runSimulation: jest.fn(),
    });
  });

  it("renders dashboard title", () => {
    render(<StepByStepDashboard />);

    expect(
      screen.getByText("Simulador Quantico Passo a Passo")
    ).toBeInTheDocument();
  });

  it("renders both protocol tabs", () => {
    render(<StepByStepDashboard />);

    expect(screen.getByText("BB84")).toBeInTheDocument();
    expect(screen.getByText("MDI-QKD")).toBeInTheDocument();
  });

  it("switches between tabs", async () => {
    render(<StepByStepDashboard />);

    const mdiTab = screen.getByText("MDI-QKD");
    fireEvent.click(mdiTab);

    await waitFor(() => {
      expect(mdiTab.parentElement).toHaveClass("text-purple-600");
    });
  });

  it("renders parameters panel", () => {
    render(<StepByStepDashboard />);

    expect(screen.getByText("Parametros BB84")).toBeInTheDocument();
  });

  it("renders simulate button", () => {
    render(<StepByStepDashboard />);

    expect(screen.getByText("Simular")).toBeInTheDocument();
  });

  it("shows initial empty state message", () => {
    render(<StepByStepDashboard />);

    expect(
      screen.getByText(/Clique em "Simular"/)
    ).toBeInTheDocument();
  });

  it("calls runSimulation when simulate button is clicked", async () => {
    const mockRunSimulation = jest.fn().mockResolvedValue(mockSimulationData);
    mockUseStepByStepSimulation.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      runSimulation: mockRunSimulation,
    });

    render(<StepByStepDashboard />);

    const simulateButton = screen.getByText("Simular");
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(mockRunSimulation).toHaveBeenCalledWith(
        "bb84",
        expect.objectContaining({
          distance_km: expect.any(Number),
          error_rate: expect.any(Number),
          efficiency: expect.any(Number),
        })
      );
    });
  });

  it("displays simulation results when data is available", () => {
    mockUseStepByStepSimulation.mockReturnValue({
      data: mockSimulationData,
      loading: false,
      error: null,
      runSimulation: jest.fn(),
    });

    render(<StepByStepDashboard />);

    expect(screen.getByText("Passo 1")).toBeInTheDocument();
    expect(screen.getByText("Resultados Finais")).toBeInTheDocument();
  });

  it("shows comparison chart when both protocols have data", () => {
    mockUseStepByStepSimulation
      .mockReturnValueOnce({
        data: mockSimulationData,
        loading: false,
        error: null,
        runSimulation: jest.fn(),
      })
      .mockReturnValueOnce({
        data: { ...mockSimulationData, protocol: "MDI-QKD" },
        loading: false,
        error: null,
        runSimulation: jest.fn(),
      });

    render(<StepByStepDashboard />);

    expect(
      screen.getByText("Comparacao entre Protocolos")
    ).toBeInTheDocument();
  });

  it("updates parameter values when slider changes", async () => {
    render(<StepByStepDashboard />);

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "50" } });

    await waitFor(() => {
      expect(inputs[0]).toHaveValue(50);
    });
  });

  it("shows loading state during simulation", () => {
    mockUseStepByStepSimulation.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      runSimulation: jest.fn(),
    });

    render(<StepByStepDashboard />);

    expect(screen.getByText("Simulando...")).toBeInTheDocument();
  });

  it("displays error message when simulation fails", () => {
    const errorMessage = "Erro na simulacao";
    mockUseStepByStepSimulation.mockReturnValue({
      data: null,
      loading: false,
      error: errorMessage,
      runSimulation: jest.fn(),
    });

    render(<StepByStepDashboard />);

    expect(screen.getByText("Erro ao carregar passos")).toBeInTheDocument();
  });

  it("switches to MDI-QKD parameters when tab changes", async () => {
    render(<StepByStepDashboard />);

    const mdiTab = screen.getByText("MDI-QKD");
    fireEvent.click(mdiTab);

    await waitFor(() => {
      expect(screen.getByText("Parametros MDI-QKD")).toBeInTheDocument();
    });
  });
});
