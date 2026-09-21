import { renderHook, waitFor, act } from "@testing-library/react";
import { useSimulationCache } from "./useSimulationCache";
import { SweepCacheProvider } from "../contexts/SweepCacheContext";
import { StepByStepResult, StepByStepSimulationParams } from "../types/stepbystep";

jest.mock("axios");
import axios from "axios";

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("useSimulationCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock da resposta de simulação BB84
  const mockBB84SimulationResponse: StepByStepResult = {
    protocol: "bb84",
    distance_km: 10,
    steps: [
      {
        step: 1,
        name: "Inicializar Quantum Bits",
        formula: "qbits = random(0,1) for each bit",
        variables: { bit_count: 4 },
        result: 4,
        unit: "bits",
        status: "completed",
        description: "Gerou 4 bits aleatórios",
      },
      {
        step: 2,
        name: "Calcular Transmissividade",
        formula: "T = 10^(-0.22 * distance_km / 10)",
        variables: { loss: 0.22, distance: 10 },
        result: 0.603,
        unit: "adimensional",
        status: "completed",
      },
    ],
    final_result: {
      secret_key_rate_bps: 1000,
      qber_percent: 1.5,
      transmissivity: 0.603,
    },
    execution_time_ms: 145,
  };

  const mockBB84Params: StepByStepSimulationParams = {
    distance_km: 10,
    fiber_loss_db_km: 0.22,
    dark_count_rate: 0.00001,
    detector_efficiency: 0.8,
  };

  it("should throw error if not used within SweepCacheProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useSimulationCache("bb84_simulation"));
    }).toThrow("useSimulationCache deve ser usado dentro de SweepCacheProvider");

    consoleSpy.mockRestore();
  });

  it("should initialize with null data and no loading", () => {
    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isCached).toBe(false);
    expect(result.current.cacheAgeSeconds).toBeNull();
  });

  it("should successfully run simulation and cache data", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    let simulationResult;
    await act(async () => {
      simulationResult = await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(simulationResult).toEqual(mockBB84SimulationResponse);
    expect(result.current.data).toEqual(mockBB84SimulationResponse);
    expect(result.current.error).toBeNull();
    expect(result.current.isCached).toBe(true);
  });

  it("should reuse cached data on subsequent calls with same parameters", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    // Primeira chamada - faz requisição
    await act(async () => {
      await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    // Segunda chamada com mesmos parâmetros - deve reutilizar cache
    let secondResult;
    await act(async () => {
      secondResult = await result.current.runSimulation("bb84", mockBB84Params);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1); // Não deve fazer nova requisição
    expect(secondResult).toEqual(mockBB84SimulationResponse);
  });

  it("should invalidate cache and refetch when parameters change", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    // Primeira chamada
    await act(async () => {
      await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    // Segunda chamada com parâmetros diferentes
    const newParams: StepByStepSimulationParams = {
      ...mockBB84Params,
      distance_km: 20, // Parâmetro diferente
    };

    mockAxios.post.mockResolvedValueOnce({
      data: { ...mockBB84SimulationResponse, distance_km: 20 },
    });

    await act(async () => {
      await result.current.runSimulation("bb84", newParams);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Deve fazer nova requisição porque parâmetros mudaram
    expect(mockAxios.post).toHaveBeenCalledTimes(2);
  });

  it("should calculate cache age in seconds", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    await act(async () => {
      await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cacheAgeSeconds).toBeGreaterThanOrEqual(0);
    expect(result.current.cacheAgeSeconds).toBeLessThan(5);
  });

  it("should clear cache when clearCache is called", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    await act(async () => {
      await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isCached).toBe(true);

    act(() => {
      result.current.clearCache();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isCached).toBe(false);
  });

  it("should handle errors correctly", async () => {
    const errorMessage = "Network error";
    mockAxios.post.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    let simulationResult;
    await act(async () => {
      simulationResult = await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(simulationResult).toBeNull();
    expect(result.current.error).toContain(errorMessage);
  });

  it("should isolate cache between different protocols", async () => {
    const mockMDISimulationResponse: StepByStepResult = {
      protocol: "mdi-qkd",
      distance_km: 10,
      steps: [],
      final_result: { secret_key_rate_bps: 2000, qber_percent: 2.0, transmissivity: 0.6 },
      execution_time_ms: 150,
    };

    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result: resultBb84 } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    // Executa simulação BB84
    await act(async () => {
      await resultBb84.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(resultBb84.current.loading).toBe(false);
    });

    // MDI-QKD cache deve estar vazio
    const { result: resultMdi } = renderHook(() => useSimulationCache("mdi_qkd_simulation"), {
      wrapper: SweepCacheProvider,
    });

    expect(resultMdi.current.data).toBeNull();
    expect(resultMdi.current.isCached).toBe(false);
  });

  it("should store parameters in cache entry", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockBB84SimulationResponse,
    });

    const { result } = renderHook(() => useSimulationCache("bb84_simulation"), {
      wrapper: SweepCacheProvider,
    });

    await act(async () => {
      await result.current.runSimulation("bb84", mockBB84Params);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // O cache deve ter armazenado os parâmetros para validação futura
    expect(result.current.isCached).toBe(true);
    expect(result.current.data).toEqual(mockBB84SimulationResponse);
  });
});
