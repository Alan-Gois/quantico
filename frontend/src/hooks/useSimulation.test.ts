import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";
import { useSimulation, useSweep } from "./useSimulation";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useSimulation Hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with null data and no error", () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.simulationData).toBeNull();
    expect(result.current.simulationError).toBeNull();
    expect(result.current.simulationLoading).toBe(false);
  });

  it("fetches simulation data successfully", async () => {
    const mockData = {
      distance_km: 50,
      sift_rate: 1000,
      qber: 0.05,
      key_rate: 100,
      secure: true,
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.runSimulation("bb84", {
        distance_km: 50,
        error_rate: 0.01,
        efficiency: 0.85,
      });
    });

    await waitFor(() => {
      expect(result.current.simulationData).toEqual(mockData);
    });
    expect(result.current.simulationLoading).toBe(false);
    expect(result.current.simulationError).toBeNull();
  });

  it("handles simulation error", async () => {
    const errorMessage = "API error";
    mockedAxios.post.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.runSimulation("bb84", {
        distance_km: 50,
        error_rate: 0.01,
        efficiency: 0.85,
      });
    });

    await waitFor(() => {
      expect(result.current.simulationError).toBeTruthy();
    });
    expect(result.current.simulationData).toBeNull();
  });

  it("sets loading state during request", async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      new Promise(() => {
        // Never resolves to keep loading state
      })
    );

    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.runSimulation("bb84", {
        distance_km: 50,
        error_rate: 0.01,
        efficiency: 0.85,
      });
    });

    expect(result.current.simulationLoading).toBe(true);
  });
});

describe("useSweep Hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with null data and no error", () => {
    const { result } = renderHook(() => useSweep());

    expect(result.current.sweepData).toBeNull();
    expect(result.current.sweepError).toBeNull();
    expect(result.current.sweepLoading).toBe(false);
  });

  it("fetches sweep data successfully", async () => {
    const mockData = {
      distances: [20, 40, 60, 80, 100],
      sift_rates: [5000, 4500, 4000, 3500, 3000],
      qbers: [0.01, 0.02, 0.03, 0.04, 0.05],
      key_rates: [500, 450, 400, 350, 300],
      secure_ranges: [true, true, true, true, false],
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useSweep());

    await act(async () => {
      await result.current.runSweep("bb84", { error_rate: 0.01 }, 20, 100);
    });

    await waitFor(() => {
      expect(result.current.sweepData).toEqual(mockData);
    });
    expect(result.current.sweepLoading).toBe(false);
    expect(result.current.sweepError).toBeNull();
  });

  it("constructs correct query parameters", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useSweep());

    await act(async () => {
      await result.current.runSweep(
        "mdi-qkd",
        { error_rate: 0.02, efficiency: 0.9 },
        10,
        90
      );
    });

    const callArgs = mockedAxios.post.mock.calls[0][0];
    expect(callArgs).toContain("/sweep/mdi-qkd");
    expect(callArgs).toContain("min_km=10");
    expect(callArgs).toContain("max_km=90");
  });
});
