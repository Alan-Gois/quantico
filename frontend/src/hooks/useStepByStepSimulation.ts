import { useState, useCallback, useRef } from "react";
import axios, { AxiosError } from "axios";
import {
  StepByStepResult,
  StepByStepSimulationParams,
} from "../types/stepbystep";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface UseStepByStepSimulationResult {
  data: StepByStepResult | null;
  loading: boolean;
  error: string | null;
  runSimulation: (
    protocol: "bb84" | "mdi-qkd",
    params: StepByStepSimulationParams
  ) => Promise<StepByStepResult | null>;
}

export const useStepByStepSimulation =
  (): UseStepByStepSimulationResult => {
    const [data, setData] = useState<StepByStepResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cacheRef = useRef<
      Map<string, StepByStepResult>
    >(new Map());

    const generateCacheKey = (
      protocol: string,
      params: StepByStepSimulationParams
    ): string => {
      return `${protocol}:${JSON.stringify(params)}`;
    };

    const runSimulation = useCallback(
      async (
        protocol: "bb84" | "mdi-qkd",
        params: StepByStepSimulationParams
      ): Promise<StepByStepResult | null> => {
        const cacheKey = generateCacheKey(protocol, params);

        // Verificar cache
        if (cacheRef.current.has(cacheKey)) {
          const cached = cacheRef.current.get(cacheKey);
          setData(cached || null);
          setError(null);
          return cached || null;
        }

        setLoading(true);
        setError(null);

        try {
          const endpoint = `${API_BASE_URL}/simulate/${protocol}/stepbystep`;

          const response = await axios.post<StepByStepResult>(
            endpoint,
            params,
            { timeout: 10000 }
          );

          const result = response.data;

          // Cachear resultado
          cacheRef.current.set(cacheKey, result);

          // Limitar cache size
          if (cacheRef.current.size > 50) {
            const firstKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(firstKey);
          }

          setData(result);
          return result;
        } catch (err) {
          const errorMessage =
            err instanceof AxiosError
              ? err.response?.data?.detail ||
                err.message ||
                "Erro desconhecido"
              : err instanceof Error
                ? err.message
                : "Erro desconhecido";

          setError(String(errorMessage));
          return null;
        } finally {
          setLoading(false);
        }
      },
      []
    );

    return {
      data,
      loading,
      error,
      runSimulation,
    };
  };
