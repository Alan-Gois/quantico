import { useContext, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/env";
import { SweepCacheContext, SimulationCacheKey } from "../contexts/SweepCacheContext";
import { StepByStepResult, StepByStepSimulationParams } from "../types/stepbystep";

/**
 * Resultado do hook useSimulationCache com estado, cache info e funções de controle.
 */
export interface UseSimulationCacheResult {
  data: StepByStepResult | null;
  loading: boolean;
  error: string | null;
  isCached: boolean;
  cacheAgeSeconds: number | null;
  runSimulation: (
    protocol: "bb84" | "mdi-qkd",
    params: StepByStepSimulationParams
  ) => Promise<StepByStepResult | null>;
  clearCache: () => void;
}

/**
 * Hook customizado com cache global persistente para simulações passo a passo.
 * Mantém dados de simulação entre navegações de abas.
 *
 * Características:
 * - Cache persiste entre mudanças de aba (usando Context)
 * - Armazena parâmetros da simulação para validar cache
 * - Mostra idade do cache (quantos segundos desde o cálculo)
 * - Permite limpeza de cache quando parâmetros mudam
 * - Identifica se dados vieram do cache ou foram calculados
 *
 * @param {SimulationCacheKey} cacheKey - Chave única (bb84_simulation ou mdi_qkd_simulation)
 * @returns {UseSimulationCacheResult} Objeto com dados, estado e controles
 *
 * @example
 * const { data, loading, isCached, cacheAgeSeconds, runSimulation, clearCache } =
 *   useSimulationCache("bb84_simulation");
 *
 * // Executar simulação ou reutilizar cache
 * await runSimulation("bb84", { distance_km: 10, fiber_loss_db_km: 0.22, ... });
 *
 * // Ver idade do cache
 * if (cacheAgeSeconds) {
 *   console.log(`Dados em cache há ${cacheAgeSeconds}s`);
 * }
 *
 * // Limpar ao mudar parâmetros
 * clearCache();
 */
export const useSimulationCache = (cacheKey: SimulationCacheKey): UseSimulationCacheResult => {
  const context = useContext(SweepCacheContext);

  if (!context) {
    throw new Error("useSimulationCache deve ser usado dentro de SweepCacheProvider");
  }

  const { getSimulationEntry, setSimulationEntry, clearSimulationEntry } = context;
  const entry = getSimulationEntry(cacheKey);

  const data = entry?.data || null;
  const loading = entry?.loading || false;
  const error = entry?.error || null;
  const isCached = entry !== undefined && entry.timestamp !== undefined;

  // Calcula idade do cache em segundos
  const cacheAgeSeconds = isCached && entry?.timestamp
    ? Math.floor((Date.now() - entry.timestamp) / 1000)
    : null;

  /**
   * Executa simulação passo a passo com suporte a cache global.
   * Se parâmetros mudarem, invalidará cache automaticamente.
   */
  const runSimulation = useCallback(
    async (
      protocol: "bb84" | "mdi-qkd",
      params: StepByStepSimulationParams
    ): Promise<StepByStepResult | null> => {
      const currentEntry = getSimulationEntry(cacheKey);

      // Verifica se há cache válido com os mesmos parâmetros
      const parametersMatch =
        currentEntry?.parameters &&
        JSON.stringify(currentEntry.parameters) === JSON.stringify(params);

      if (currentEntry?.data && parametersMatch) {
        // Cache válido, retorna dados sem fazer nova requisição
        return currentEntry.data;
      }

      // Marca como carregando
      setSimulationEntry(cacheKey, {
        loading: true,
        error: null,
      });

      try {
        const endpoint = `${API_BASE_URL}/simulate/${protocol}/stepbystep`;

        const response = await axios.post<StepByStepResult>(
          endpoint,
          params,
          { timeout: 10000 }
        );

        const result = response.data;

        // Armazena no cache global com timestamp e parâmetros
        setSimulationEntry(cacheKey, {
          data: result,
          timestamp: Date.now(),
          loading: false,
          error: null,
          parameters: params,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.detail ||
              err.message ||
              "Erro ao executar simulação"
            : err instanceof Error
              ? err.message
              : "Erro desconhecido";

        setSimulationEntry(cacheKey, {
          loading: false,
          error: String(errorMessage),
        });

        return null;
      }
    },
    [cacheKey, getSimulationEntry, setSimulationEntry]
  );

  const clearCache = useCallback(() => {
    clearSimulationEntry(cacheKey);
  }, [cacheKey, clearSimulationEntry]);

  return {
    data,
    loading,
    error,
    isCached,
    cacheAgeSeconds,
    runSimulation,
    clearCache,
  };
};
