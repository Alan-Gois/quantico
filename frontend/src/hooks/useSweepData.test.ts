import { renderHook, waitFor, act } from "@testing-library/react";
import { useSweepData, SweepResponse } from "./useSweepData";

jest.mock("axios");
import axios from "axios";

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("useSweepData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

    // Mock da resposta bruta da API (antes da transformação)
  const mockRawSweepResponse = {
    protocol: "BB84",
    data: [
      { distance_km: 0, secret_key_rate_bps: 1000000, qber_percent: 0.5, transmissivity: 1.0 },
      { distance_km: 10, secret_key_rate_bps: 500000, qber_percent: 1.0, transmissivity: 0.5 },
      { distance_km: 20, secret_key_rate_bps: 100000, qber_percent: 2.5, transmissivity: 0.25 },
      { distance_km: 30, secret_key_rate_bps: 10000, qber_percent: 5.0, transmissivity: 0.1 },
    ],
    statistics: {
      max_key_rate: 1000000,
      min_key_rate: 10000,
      mean_key_rate: 402500,
      max_qber: 5.0,
      min_qber: 0.5,
    },
  };

  // Resposta esperada após transformação
  const mockSweepResponse: SweepResponse = {
    protocol: "BB84",
    data: [
      { distance: 0, keyRate: 1000000, qber: 0.5, transmissivity: 1.0 },
      { distance: 10, keyRate: 500000, qber: 1.0, transmissivity: 0.5 },
      { distance: 20, keyRate: 100000, qber: 2.5, transmissivity: 0.25 },
      { distance: 30, keyRate: 10000, qber: 5.0, transmissivity: 0.1 },
    ],
    statistics: {
      max_key_rate: 1000000,
      min_key_rate: 10000,
      mean_key_rate: 402500,
      max_qber: 5.0,
      min_qber: 0.5,
    },
  };

  it("should initialize with null data and no loading", () => {
    const { result } = renderHook(() => useSweepData());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should successfully run sweep and return data", async () => {
    // API retorna dados em snake_case
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepData());

    let sweepResult;
    await act(async () => {
      sweepResult = await result.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // O hook transforma os dados antes de retorná-los
    expect(sweepResult).toEqual(mockSweepResponse);
    expect(result.current.data).toEqual(mockSweepResponse);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors correctly", async () => {
    const errorMessage = "Network error";
    mockAxios.post.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useSweepData());

    let sweepResult;
    await act(async () => {
      sweepResult = await result.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(sweepResult).toBeNull();
    expect(result.current.error).toContain(errorMessage);
  });

  it("should cache results and not refetch if parameters are same", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepData());

    const params = { protocol: "bb84", minKm: 0, maxKm: 30, numPoints: 15 };

    await act(async () => {
      await result.current.runSweep(params.protocol as "bb84", params.minKm, params.maxKm, params.numPoints);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.runSweep(params.protocol as "bb84", params.minKm, params.maxKm, params.numPoints);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });

  it("should include additional parameters in request", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepData());

    const additionalParams = {
      fiber_loss_db_km: 0.22,
      detector_efficiency: 0.8,
      dark_count_rate: 0.00001,
    };

    await act(async () => {
      await result.current.runSweep(
        "bb84",
        0,
        30,
        15,
        additionalParams
      );
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      {
        params: {
          min_km: 0,
          max_km: 30,
          num_points: 15,
          ...additionalParams,
        },
        timeout: 30000,
      }
    );
  });

  it("should set loading state correctly during fetch", async () => {
    mockAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockRawSweepResponse });
          }, 100);
        })
    );

    const { result } = renderHook(() => useSweepData());

    await act(async () => {
      await result.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
