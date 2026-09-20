import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";
import { useStepByStepSimulation } from "./useStepByStepSimulation";
import { StepByStepResult } from "../types/stepbystep";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useStepByStepSimulation", () => {
  const mockResult: StepByStepResult = {
    protocol: "BB84",
    distance_km: 10,
    steps: [
      {
        step: 1,
        name: "Atenuacao",
        formula: "A(L) = L × α",
        variables: { L: 10, α: 0.22 },
        result: 2.2,
        unit: "dB",
        status: "completed",
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
    jest.clearAllMocks();
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useStepByStepSimulation());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("runs simulation successfully", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: mockResult,
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    await act(async () => {
      const response = await result.current.runSimulation("bb84", {
        distance_km: 10,
        error_rate: 0.01,
        efficiency: 0.8,
        basis_choice_error: 0.05,
        detector_efficiency: 0.8,
      });

      expect(response).toEqual(mockResult);
    });

    expect(result.current.data).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it("handles simulation error", async () => {
    const errorMessage = "Erro na simulacao";
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: { detail: errorMessage },
      },
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    await act(async () => {
      await result.current.runSimulation("bb84", {
        distance_km: 10,
        error_rate: 0.01,
        efficiency: 0.8,
        basis_choice_error: 0.05,
        detector_efficiency: 0.8,
      });
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it("caches results for identical parameters", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: mockResult,
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    const params = {
      distance_km: 10,
      error_rate: 0.01,
      efficiency: 0.8,
      basis_choice_error: 0.05,
      detector_efficiency: 0.8,
    };

    // First call
    await act(async () => {
      await result.current.runSimulation("bb84", params);
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    // Second call with same params should use cache
    let secondResult;
    await act(async () => {
      secondResult = await result.current.runSimulation("bb84", params);
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Still 1, not 2
    expect(secondResult).toEqual(mockResult);
  });

  it("calls correct API endpoint", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: mockResult,
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    const params = {
      distance_km: 20,
      error_rate: 0.02,
      efficiency: 0.9,
      basis_choice_error: 0.01,
      detector_efficiency: 0.9,
    };

    await act(async () => {
      await result.current.runSimulation("mdi-qkd", params);
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/simulate/mdi-qkd/stepbystep"),
      params,
      { timeout: 10000 }
    );
  });

  it("respects cache size limit", async () => {
    mockedAxios.post.mockResolvedValue({
      data: mockResult,
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    // Simulate 51 different parameter combinations to exceed cache limit of 50
    for (let i = 0; i < 51; i++) {
      const params = {
        distance_km: i,
        error_rate: 0.01,
        efficiency: 0.8,
        basis_choice_error: 0.05,
        detector_efficiency: 0.8,
      };

      await act(async () => {
        await result.current.runSimulation("bb84", params);
      });
    }

    // Should have made 51 API calls since cache is limited to 50
    expect(mockedAxios.post).toHaveBeenCalledTimes(51);
  });

  it("handles network error without response", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      request: {},
      message: "Network error",
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    await act(async () => {
      await result.current.runSimulation("bb84", {
        distance_km: 10,
        error_rate: 0.01,
        efficiency: 0.8,
        basis_choice_error: 0.05,
        detector_efficiency: 0.8,
      });
    });

    expect(result.current.error).toBe("Network error");
  });

  it("returns null on simulation error", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: "Erro" } },
    });

    const { result } = renderHook(() => useStepByStepSimulation());

    let simulationResult;
    await act(async () => {
      simulationResult = await result.current.runSimulation("bb84", {
        distance_km: 10,
        error_rate: 0.01,
        efficiency: 0.8,
        basis_choice_error: 0.05,
        detector_efficiency: 0.8,
      });
    });

    expect(simulationResult).toBeNull();
  });
});
