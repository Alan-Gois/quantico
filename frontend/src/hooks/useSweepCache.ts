import { useContext, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/env";
import { SweepCacheContext, CacheKey } from "../contexts/SweepCacheContext";
import { SweepResponse } from "./useSweepData";
import { transformSweepData, RawSweepResponse } from "../utils/sweepDataTransformer";

/**
 * Resultado do hook useSweepCache com estado, cache info e funções de controle.
 */
export interface UseSweepCacheResult {
  data: SweepResponse | null;
  loading: boolean;
  error: string | null;
  isCached: boolean;
  cacheAgeSeconds: number | null;
  runSweep: (
    protocol: "bb84" | "mdi-qkd",
    minKm: number,
    maxKm: number,
    numPoints: number,
    additionalParams?: Record<string, number>,
    forceRefresh?: boolean
  ) => Promise<SweepResponse | null>;
  clearCache: () => void;
}

/**
 * Hook customizado com cache global persistente entre mudanças de aba.
 *
 * Características:
 * - Cache persiste entre mudanças de aba (usando Context)
 * - Reutiliza dados se disponível
 * - Mostra idade do cache (quantos segundos desde o cálculo)
 * - Permite força de recálculo com forceRefresh
 * - Identifica se dados vieram do cache ou foram calculados
 *
 * @param {CacheKey} cacheKey - Chave única para este conjunto de dados (bb84, mdi_qkd, etc)
 * @returns {UseSweepCacheResult} Objeto com dados, estado e controles
 *
 * @example
 * const { data, loading, error, isCached, cacheAgeSeconds, runSweep } = useSweepCache("bb84");
 *
 * // Executar varredura ou reutilizar cache
 * await runSweep("bb84", 0, 30, 15, params);
 *
 * // Forçar recalculação mesmo com cache
 * await runSweep("bb84", 0, 30, 15, params, true);
 */
export const useSweepCache = (cacheKey: CacheKey): UseSweepCacheResult => {
  const context = useContext(SweepCacheContext);

  if (!context) {
    throw new Error("useSweepCache deve ser usado dentro de SweepCacheProvider");
  }

  const { getEntry, setEntry, clearEntry } = context;
  const entry = getEntry(cacheKey);

  const data = entry?.data || null;
  const loading = entry?.loading || false;
  const error = entry?.error || null;
  const isCached = entry !== undefined && entry.timestamp !== undefined;

  // Calcula idade do cache em segundos
  const cacheAgeSeconds = isCached && entry?.timestamp
    ? Math.floor((Date.now() - entry.timestamp) / 1000)
    : null;

  const generateCacheKey = (
    protocol: string,
    minKm: number,
    maxKm: number,
    numPoints: number,
    additionalParams?: Record<string, number>
  ): string => {
    const params = {
      protocol,
      minKm,
      maxKm,
      numPoints,
      ...additionalParams,
    };
    return JSON.stringify(params);
  };

  /**
   * Executa varredura com suporte a cache global e refetch forçado.
   * Se dados estão em cache e forceRefresh é false, reutiliza dados.
   */
  const runSweep = useCallback(
    async (
      protocol: "bb84" | "mdi-qkd",
      minKm: number,
      maxKm: number,
      numPoints: number,
      additionalParams?: Record<string, number>,
      forceRefresh?: boolean
    ): Promise<SweepResponse | null> => {
      const currentEntry = getEntry(cacheKey);

      // Se há cache válido e não está forçando refresh, reutiliza
      if (currentEntry?.data && !forceRefresh) {
        return currentEntry.data;
      }

      // Marca como carregando
      setEntry(cacheKey, {
        loading: true,
        error: null,
      });

      try {
        const endpoint = `${API_BASE_URL}/sweep/${protocol}`;

        const params = {
          min_km: minKm,
          max_km: maxKm,
          num_points: numPoints,
          ...(additionalParams || {}),
        };

        const response = await axios.post<RawSweepResponse>(
          endpoint,
          {},
          {
            params,
            timeout: 30000,
          }
        );

        const rawData = response.data;

        // Transforma dados da API para formato esperado pelo frontend
        const result: SweepResponse = {
          protocol: rawData.protocol,
          data: transformSweepData(rawData.data),
          statistics: rawData.statistics,
        };

        // Armazena no cache global com timestamp
        setEntry(cacheKey, {
          data: result,
          timestamp: Date.now(),
          loading: false,
          error: null,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.detail ||
              err.message ||
              "Erro ao carregar dados de sweep"
            : err instanceof Error
              ? err.message
              : "Erro desconhecido";

        setEntry(cacheKey, {
          loading: false,
          error: String(errorMessage),
        });

        return null;
      }
    },
    [cacheKey, getEntry, setEntry]
  );

  const clearCache = useCallback(() => {
    clearEntry(cacheKey);
  }, [cacheKey, clearEntry]);

  return {
    data,
    loading,
    error,
    isCached,
    cacheAgeSeconds,
    runSweep,
    clearCache,
  };
};
