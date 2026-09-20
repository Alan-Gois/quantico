import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { SimulationResult, SweepResult, ProtocolParameters } from "../types";

interface UseSimulationResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = "http://localhost:8000";

export const useSimulation = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(
    null
  );
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const runSimulation = useCallback(
    async (
      protocol: "bb84" | "mdi-qkd",
      params: ProtocolParameters
    ): Promise<SimulationResult | null> => {
      setSimulationLoading(true);
      setSimulationError(null);

      try {
        const endpoint = `${API_BASE_URL}/simulate/${protocol}`;
        const response = await axios.post<SimulationResult>(endpoint, params);

        setSimulationData(response.data);
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.detail || err.message
            : "Unknown error occurred";
        setSimulationError(String(errorMessage));
        return null;
      } finally {
        setSimulationLoading(false);
      }
    },
    []
  );

  return {
    simulationData,
    simulationLoading,
    simulationError,
    runSimulation,
  };
};

export const useSweep = () => {
  const [sweepData, setSweepData] = useState<SweepResult | null>(null);
  const [sweepLoading, setSweepLoading] = useState(false);
  const [sweepError, setSweepError] = useState<string | null>(null);

  const runSweep = useCallback(
    async (
      protocol: "bb84" | "mdi-qkd",
      params: Record<string, number>,
      minKm: number = 20,
      maxKm: number = 100
    ): Promise<SweepResult | null> => {
      setSweepLoading(true);
      setSweepError(null);

      try {
        const queryParams = new URLSearchParams({
          min_km: String(minKm),
          max_km: String(maxKm),
          ...Object.entries(params).reduce(
            (acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>
          ),
        });

        const endpoint = `${API_BASE_URL}/sweep/${protocol}?${queryParams.toString()}`;
        const response = await axios.post<SweepResult>(endpoint);

        setSweepData(response.data);
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.detail || err.message
            : "Unknown error occurred";
        setSweepError(String(errorMessage));
        return null;
      } finally {
        setSweepLoading(false);
      }
    },
    []
  );

  return {
    sweepData,
    sweepLoading,
    sweepError,
    runSweep,
  };
};
