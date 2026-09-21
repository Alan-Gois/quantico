import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StepByStepDashboard from "./StepByStepDashboard";
import { useSimulationCache } from "../hooks/useSimulationCache";
import { SweepCacheProvider } from "../contexts/SweepCacheContext";

jest.mock("../hooks/useSimulationCache");

describe("StepByStepDashboard", () => {
  const mockUseSimulationCache = useSimulationCache as jest.MockedFunction<
    typeof useSimulationCache
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
    mockUseSimulationCache.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      isCached: false,
      cacheAgeSeconds: null,
      runSimulation: jest.fn(),
      clearCache: jest.fn(),
    });
  });

  it("renders dashboard title", () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(
      screen.getByText("Simulador Quantico Passo a Passo")
    ).toBeInTheDocument();
  });

  it("renders both protocol tabs", () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("BB84")).toBeInTheDocument();
    expect(screen.getByText("MDI-QKD")).toBeInTheDocument();
  });

  it("switches between tabs", async () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    const mdiTab = screen.getByText("MDI-QKD");
    fireEvent.click(mdiTab);

    await waitFor(() => {
      expect(mdiTab).toHaveClass("text-purple-600");
    });
  });

  it("renders parameters panel", () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("Parametros BB84")).toBeInTheDocument();
  });

  it("renders simulate button", () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("Simular")).toBeInTheDocument();
  });

  it("shows initial empty state message", () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(
      screen.getByText(/Clique em "Simular"/)
    ).toBeInTheDocument();
  });

  it("calls runSimulation when simulate button is clicked", async () => {
    const mockRunSimulation = jest.fn().mockResolvedValue(mockSimulationData);
    mockUseSimulationCache.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      isCached: false,
      cacheAgeSeconds: null,
      runSimulation: mockRunSimulation,
      clearCache: jest.fn(),
    });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    const simulateButton = screen.getByText("Simular");
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(mockRunSimulation).toHaveBeenCalledWith(
        "bb84",
        expect.objectContaining({
          distance_km: expect.any(Number),
          fiber_loss_db_km: expect.any(Number),
          detector_efficiency: expect.any(Number),
        })
      );
    });
  });

  it("displays simulation results when data is available", () => {
    mockUseSimulationCache.mockReturnValue({
      data: mockSimulationData,
      loading: false,
      error: null,
      isCached: false,
      cacheAgeSeconds: null,
      runSimulation: jest.fn(),
      clearCache: jest.fn(),
    });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("Passo 1")).toBeInTheDocument();
    expect(screen.getByText("Resultados Finais")).toBeInTheDocument();
  });

  it("shows comparison chart when both protocols have data", () => {
    mockUseSimulationCache
      .mockReturnValueOnce({
        data: mockSimulationData,
        loading: false,
        error: null,
        isCached: false,
        cacheAgeSeconds: null,
        runSimulation: jest.fn(),
        clearCache: jest.fn(),
      })
      .mockReturnValueOnce({
        data: { ...mockSimulationData, protocol: "MDI-QKD" },
        loading: false,
        error: null,
        isCached: false,
        cacheAgeSeconds: null,
        runSimulation: jest.fn(),
        clearCache: jest.fn(),
      });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(
      screen.getByText("Comparacao entre Protocolos")
    ).toBeInTheDocument();
  });

  it("updates parameter values when slider changes", async () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "50" } });

    await waitFor(() => {
      expect(inputs[0]).toHaveValue(50);
    });
  });

  it("shows loading state during simulation", () => {
    mockUseSimulationCache.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      isCached: false,
      cacheAgeSeconds: null,
      runSimulation: jest.fn(),
      clearCache: jest.fn(),
    });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("Simulando...")).toBeInTheDocument();
  });

  it("displays error message when simulation fails", () => {
    const errorMessage = "Erro na simulacao";
    mockUseSimulationCache.mockReturnValue({
      data: null,
      loading: false,
      error: errorMessage,
      isCached: false,
      cacheAgeSeconds: null,
      runSimulation: jest.fn(),
      clearCache: jest.fn(),
    });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("Erro ao carregar passos")).toBeInTheDocument();
  });

  it("switches to MDI-QKD parameters when tab changes", async () => {
    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    const mdiTab = screen.getByText("MDI-QKD");
    fireEvent.click(mdiTab);

    await waitFor(() => {
      expect(screen.getByText("Parametros MDI-QKD")).toBeInTheDocument();
    });
  });

  it("displays cache age badge when data is cached", () => {
    mockUseSimulationCache.mockReturnValue({
      data: mockSimulationData,
      loading: false,
      error: null,
      isCached: true,
      cacheAgeSeconds: 45,
      runSimulation: jest.fn(),
      clearCache: jest.fn(),
    });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.getByText("Dados em cache há 45s")).toBeInTheDocument();
  });

  it("hides cache badge when data is being loaded", () => {
    mockUseSimulationCache.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      isCached: false,
      cacheAgeSeconds: null,
      runSimulation: jest.fn(),
      clearCache: jest.fn(),
    });

    render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    expect(screen.queryByText(/Dados em cache/)).not.toBeInTheDocument();
  });

  it("persists data between tab switches", async () => {
    const mockRunSimulation = jest.fn().mockResolvedValue(mockSimulationData);
    mockUseSimulationCache
      .mockReturnValueOnce({
        data: mockSimulationData,
        loading: false,
        error: null,
        isCached: true,
        cacheAgeSeconds: 10,
        runSimulation: mockRunSimulation,
        clearCache: jest.fn(),
      })
      .mockReturnValueOnce({
        data: null,
        loading: false,
        error: null,
        isCached: false,
        cacheAgeSeconds: null,
        runSimulation: jest.fn(),
        clearCache: jest.fn(),
      });

    const { rerender } = render(
      <SweepCacheProvider>
        <StepByStepDashboard />
      </SweepCacheProvider>
    );

    // Data from BB84 is cached
    expect(screen.getByText("Passo 1")).toBeInTheDocument();
    expect(screen.getByText("Dados em cache há 10s")).toBeInTheDocument();

    // Switch to MDI-QKD
    const mdiTab = screen.getByText("MDI-QKD");
    fireEvent.click(mdiTab);

    await waitFor(() => {
      expect(screen.getByText("Parametros MDI-QKD")).toBeInTheDocument();
    });
  });
});
