import React, { createContext, useState, useCallback } from "react";
import { SweepResponse } from "../hooks/useSweepData";
import { StepByStepResult, StepByStepSimulationParams } from "../types/stepbystep";

/**
 * Entrada do cache com dados, timestamp e estado de carregamento.
 */
export interface CacheEntry {
  data: SweepResponse | null;
  timestamp: number;
  loading: boolean;
  error: string | null;
}

/**
 * Entrada do cache de simulação com dados passo a passo, timestamp e parâmetros.
 */
export interface SimulationCacheEntry {
  data: StepByStepResult | null;
  timestamp: number;
  loading: boolean;
  error: string | null;
  parameters: StepByStepSimulationParams | null;
}

/**
 * Chaves de cache suportadas para cada tipo de gráfico/aba.
 */
export type CacheKey = "bb84" | "mdi_qkd" | "comparison_bb84" | "comparison_mdi";

/**
 * Chaves de cache de simulação para BB84 e MDI-QKD.
 */
export type SimulationCacheKey = "bb84_simulation" | "mdi_qkd_simulation";

/**
 * Contexto de cache global para varreduras de distância e simulações passo a passo.
 * Permite que dados persistam entre mudanças de aba.
 */
interface SweepCacheContextType {
  cache: Record<CacheKey, CacheEntry | undefined>;
  simulationCache: Record<SimulationCacheKey, SimulationCacheEntry | undefined>;
  getEntry: (key: CacheKey) => CacheEntry | undefined;
  setEntry: (key: CacheKey, entry: Partial<CacheEntry>) => void;
  clearEntry: (key: CacheKey) => void;
  clearAllCache: () => void;
  getSimulationEntry: (key: SimulationCacheKey) => SimulationCacheEntry | undefined;
  setSimulationEntry: (key: SimulationCacheKey, entry: Partial<SimulationCacheEntry>) => void;
  clearSimulationEntry: (key: SimulationCacheKey) => void;
  clearAllSimulationCache: () => void;
}

export const SweepCacheContext = createContext<SweepCacheContextType | undefined>(undefined);

/**
 * Provider para o contexto de cache unificado de varreduras e simulações.
 * Deve envolver toda a aplicação para permitir persistência de dados entre abas.
 *
 * Características:
 * - Cache de varreduras (sweep) para gráficos
 * - Cache de simulações (step-by-step) para dashboard
 * - Ambos persistem durante navegação entre abas
 * - Cada tipo possui métodos de acesso e limpeza independentes
 */
export const SweepCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Record<CacheKey, CacheEntry | undefined>>({
    bb84: undefined,
    mdi_qkd: undefined,
    comparison_bb84: undefined,
    comparison_mdi: undefined,
  });

  const [simulationCache, setSimulationCache] = useState<Record<SimulationCacheKey, SimulationCacheEntry | undefined>>({
    bb84_simulation: undefined,
    mdi_qkd_simulation: undefined,
  });

  // Métodos para cache de varreduras
  const getEntry = useCallback((key: CacheKey): CacheEntry | undefined => {
    return cache[key];
  }, [cache]);

  const setEntry = useCallback((key: CacheKey, entry: Partial<CacheEntry>) => {
    setCache((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...entry,
      } as CacheEntry,
    }));
  }, []);

  const clearEntry = useCallback((key: CacheKey) => {
    setCache((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  }, []);

  const clearAllCache = useCallback(() => {
    setCache({
      bb84: undefined,
      mdi_qkd: undefined,
      comparison_bb84: undefined,
      comparison_mdi: undefined,
    });
  }, []);

  // Métodos para cache de simulações
  const getSimulationEntry = useCallback((key: SimulationCacheKey): SimulationCacheEntry | undefined => {
    return simulationCache[key];
  }, [simulationCache]);

  const setSimulationEntry = useCallback((key: SimulationCacheKey, entry: Partial<SimulationCacheEntry>) => {
    setSimulationCache((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...entry,
      } as SimulationCacheEntry,
    }));
  }, []);

  const clearSimulationEntry = useCallback((key: SimulationCacheKey) => {
    setSimulationCache((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  }, []);

  const clearAllSimulationCache = useCallback(() => {
    setSimulationCache({
      bb84_simulation: undefined,
      mdi_qkd_simulation: undefined,
    });
  }, []);

  const value: SweepCacheContextType = {
    cache,
    simulationCache,
    getEntry,
    setEntry,
    clearEntry,
    clearAllCache,
    getSimulationEntry,
    setSimulationEntry,
    clearSimulationEntry,
    clearAllSimulationCache,
  };

  return (
    <SweepCacheContext.Provider value={value}>
      {children}
    </SweepCacheContext.Provider>
  );
};
