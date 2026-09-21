import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSweepCache } from "./useSweepCache";
import { SweepCacheProvider } from "../contexts/SweepCacheContext";
import { SweepResponse } from "./useSweepData";

jest.mock("axios");
import axios from "axios";

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("useSweepCache", () => {
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

  it("should throw error if not used within SweepCacheProvider", () => {
    // Suprime console.error para este teste
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useSweepCache("bb84"));
    }).toThrow("useSweepCache deve ser usado dentro de SweepCacheProvider");

    consoleSpy.mockRestore();
  });

  it("should initialize with null data and no loading", () => {
    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isCached).toBe(false);
    expect(result.current.cacheAgeSeconds).toBeNull();
  });

  it("should successfully run sweep and cache data", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

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
    expect(result.current.isCached).toBe(true);
  });

  it("should reuse cached data on subsequent calls", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

    // Primeira chamada - faz fetch
    await act(async () => {
      await result.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    // Segunda chamada - deve reutilizar cache
    let secondResult;
    await act(async () => {
      secondResult = await result.current.runSweep("bb84", 0, 30, 15);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(secondResult).toEqual(mockSweepResponse);
  });

  it("should force refetch when forceRefresh is true", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

    // Primeira chamada
    await act(async () => {
      await result.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(1);

    // Segunda chamada com forceRefresh
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    await act(async () => {
      await result.current.runSweep("bb84", 0, 30, 15, undefined, true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAxios.post).toHaveBeenCalledTimes(2);
  });

  it("should calculate cache age in seconds", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

    await act(async () => {
      await result.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cacheAgeSeconds).toBeGreaterThanOrEqual(0);
    expect(result.current.cacheAgeSeconds).toBeLessThan(5);
  });

  it("should clear cache when clearCache is called", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

    await act(async () => {
      await result.current.runSweep("bb84", 0, 30, 15);
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

    const { result } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

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

  it("should share cache within same provider instance", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockRawSweepResponse,
    });

    const wrapper = SweepCacheProvider;

    const { result: result1 } = renderHook(() => useSweepCache("bb84"), {
      wrapper,
    });

    // Primeiro hook executa varredura
    await act(async () => {
      await result1.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    expect(result1.current.data).toEqual(mockSweepResponse);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });

  it("should isolate cache between different cache keys", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: mockSweepResponse,
    });

    const { result: resultBb84 } = renderHook(() => useSweepCache("bb84"), {
      wrapper: SweepCacheProvider,
    });

    // Executa varredura BB84
    await act(async () => {
      await resultBb84.current.runSweep("bb84", 0, 30, 15);
    });

    await waitFor(() => {
      expect(resultBb84.current.loading).toBe(false);
    });

    // MDI-QKD deve estar vazio
    const { result: resultMdi } = renderHook(() => useSweepCache("mdi_qkd"), {
      wrapper: SweepCacheProvider,
    });

    expect(resultMdi.current.data).toBeNull();
    expect(resultMdi.current.isCached).toBe(false);
  });
});
