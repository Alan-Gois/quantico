import React from "react";
import { renderHook, act } from "@testing-library/react";
import { SweepCacheProvider, SweepCacheContext } from "./SweepCacheContext";
import { StepByStepResult } from "../types/stepbystep";

describe("SweepCacheContext", () => {
  const mockSimulationData: StepByStepResult = {
    protocol: "bb84",
    distance_km: 10,
    steps: [],
    final_result: { secret_key_rate_bps: 1000, qber_percent: 1.5, transmissivity: 0.6 },
    execution_time_ms: 150,
  };

  it("provides context with cache methods", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current?.cache).toBeDefined();
    expect(result.current?.simulationCache).toBeDefined();
    expect(result.current?.getEntry).toBeDefined();
    expect(result.current?.setEntry).toBeDefined();
    expect(result.current?.getSimulationEntry).toBeDefined();
    expect(result.current?.setSimulationEntry).toBeDefined();
  });

  it("initializes with empty sweep cache", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    expect(result.current?.cache.bb84).toBeUndefined();
    expect(result.current?.cache.mdi_qkd).toBeUndefined();
  });

  it("initializes with empty simulation cache", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    expect(result.current?.simulationCache.bb84_simulation).toBeUndefined();
    expect(result.current?.simulationCache.mdi_qkd_simulation).toBeUndefined();
  });

  it("stores and retrieves simulation cache entry", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    const testEntry = {
      data: mockSimulationData,
      timestamp: Date.now(),
      loading: false,
      error: null,
      parameters: { distance_km: 10 },
    };

    act(() => {
      result.current?.setSimulationEntry("bb84_simulation", testEntry);
    });

    const retrieved = result.current?.getSimulationEntry("bb84_simulation");
    expect(retrieved?.data).toEqual(mockSimulationData);
    expect(retrieved?.timestamp).toEqual(testEntry.timestamp);
  });

  it("clears single simulation cache entry", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    const testEntry = {
      data: mockSimulationData,
      timestamp: Date.now(),
      loading: false,
      error: null,
      parameters: { distance_km: 10 },
    };

    act(() => {
      result.current?.setSimulationEntry("bb84_simulation", testEntry);
    });

    expect(result.current?.getSimulationEntry("bb84_simulation")).toBeDefined();

    act(() => {
      result.current?.clearSimulationEntry("bb84_simulation");
    });

    expect(result.current?.getSimulationEntry("bb84_simulation")).toBeUndefined();
  });

  it("clears all simulation cache entries", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    const testEntry = {
      data: mockSimulationData,
      timestamp: Date.now(),
      loading: false,
      error: null,
      parameters: { distance_km: 10 },
    };

    act(() => {
      result.current?.setSimulationEntry("bb84_simulation", testEntry);
      result.current?.setSimulationEntry("mdi_qkd_simulation", testEntry);
    });

    expect(result.current?.getSimulationEntry("bb84_simulation")).toBeDefined();
    expect(result.current?.getSimulationEntry("mdi_qkd_simulation")).toBeDefined();

    act(() => {
      result.current?.clearAllSimulationCache();
    });

    expect(result.current?.getSimulationEntry("bb84_simulation")).toBeUndefined();
    expect(result.current?.getSimulationEntry("mdi_qkd_simulation")).toBeUndefined();
  });

  it("isolates BB84 and MDI-QKD simulation caches", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    const bb84Data: StepByStepResult = {
      protocol: "bb84",
      distance_km: 10,
      steps: [],
      final_result: { secret_key_rate_bps: 1000, qber_percent: 1.5, transmissivity: 0.6 },
      execution_time_ms: 150,
    };

    const mdiData: StepByStepResult = {
      protocol: "mdi-qkd",
      distance_km: 10,
      steps: [],
      final_result: { secret_key_rate_bps: 2000, qber_percent: 2.0, transmissivity: 0.65 },
      execution_time_ms: 160,
    };

    act(() => {
      result.current?.setSimulationEntry("bb84_simulation", {
        data: bb84Data,
        timestamp: Date.now(),
        loading: false,
        error: null,
        parameters: { distance_km: 10 },
      });
      result.current?.setSimulationEntry("mdi_qkd_simulation", {
        data: mdiData,
        timestamp: Date.now(),
        loading: false,
        error: null,
        parameters: { distance_km: 10 },
      });
    });

    const bb84Retrieved = result.current?.getSimulationEntry("bb84_simulation");
    const mdiRetrieved = result.current?.getSimulationEntry("mdi_qkd_simulation");

    expect(bb84Retrieved?.data?.protocol).toEqual("bb84");
    expect(mdiRetrieved?.data?.protocol).toEqual("mdi-qkd");
  });

  it("updates partial simulation cache entry", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    const initialEntry = {
      data: mockSimulationData,
      timestamp: Date.now(),
      loading: false,
      error: null,
      parameters: { distance_km: 10 },
    };

    act(() => {
      result.current?.setSimulationEntry("bb84_simulation", initialEntry);
    });

    act(() => {
      result.current?.setSimulationEntry("bb84_simulation", {
        loading: true,
        error: "Erro novo",
      });
    });

    const updated = result.current?.getSimulationEntry("bb84_simulation");
    expect(updated?.data).toEqual(mockSimulationData); // Original data preserved
    expect(updated?.loading).toBe(true);
    expect(updated?.error).toBe("Erro novo");
  });

  it("maintains both sweep and simulation caches independently", () => {
    const { result } = renderHook(() => React.useContext(SweepCacheContext), {
      wrapper: SweepCacheProvider,
    });

    const sweepEntry = {
      data: null,
      timestamp: Date.now(),
      loading: false,
      error: null,
    };

    const simulationEntry = {
      data: mockSimulationData,
      timestamp: Date.now(),
      loading: false,
      error: null,
      parameters: { distance_km: 10 },
    };

    act(() => {
      result.current?.setEntry("bb84", sweepEntry);
      result.current?.setSimulationEntry("bb84_simulation", simulationEntry);
    });

    // Both should exist independently
    expect(result.current?.getEntry("bb84")).toBeDefined();
    expect(result.current?.getSimulationEntry("bb84_simulation")).toBeDefined();

    // Clear sweep cache shouldn't affect simulation cache
    act(() => {
      result.current?.clearEntry("bb84");
    });

    expect(result.current?.getEntry("bb84")).toBeUndefined();
    expect(result.current?.getSimulationEntry("bb84_simulation")).toBeDefined();
  });
});
