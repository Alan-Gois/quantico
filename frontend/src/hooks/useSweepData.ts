import { useState, useCallback, useRef } from "react";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../config/env";
import { transformSweepData, RawSweepResponse } from "../utils/sweepDataTransformer";

/**
 * Representa um ponto de dados de varredura de distancia.
 * Inclui metricas quanticas para uma distancia especifica.
 *
 * @interface SweepDataPoint
 * @property {number} distance - Distancia em kilometros (km)
 * @property {number} keyRate - Taxa de chave secreta em bits por segundo (bps)
 * @property {number} qber - Taxa de erro quantico em bits (percentual)
 * @property {number} transmissivity - Transmissividade do canal optico (0-1)
 */
export interface SweepDataPoint {
  distance: number;
  keyRate: number;
  qber: number;
  transmissivity: number;
}

/**
 * Resposta da API contendo dados de varredura de distancia e estatisticas.
 * Utilizado tanto para BB84 quanto para MDI-QKD.
 *
 * @interface SweepResponse
 * @property {string} protocol - Protocolo utilizado (BB84 ou MDI-QKD)
 * @property {SweepDataPoint[]} data - Array de pontos de dados varredura
 * @property {Object} statistics - Estatisticas agregadas dos dados
 * @property {number} statistics.max_key_rate - Taxa de chave maxima observada
 * @property {number} statistics.min_key_rate - Taxa de chave minima observada
 * @property {number} statistics.mean_key_rate - Taxa de chave media
 * @property {number} [statistics.max_qber] - QBER maximo observado
 * @property {number} [statistics.min_qber] - QBER minimo observado
 */
export interface SweepResponse {
  protocol: string;
  data: SweepDataPoint[];
  statistics: {
    max_key_rate: number;
    min_key_rate: number;
    mean_key_rate: number;
    max_qber?: number;
    min_qber?: number;
  };
}

/**
 * Resultado do hook useSweepData com estado e funcoes para executar varreduras.
 */
interface UseSweepDataResult {
  data: SweepResponse | null;
  loading: boolean;
  error: string | null;
  runSweep: (
    protocol: "bb84" | "mdi-qkd",
    minKm: number,
    maxKm: number,
    numPoints: number,
    additionalParams?: Record<string, number>
  ) => Promise<SweepResponse | null>;
}

/**
 * Hook customizado para executar varreduras de distancia (sweep) para protocolos quanticos.
 *
 * Gerencia:
 * - Estado de carregamento, erro e dados
 * - Cache de resultados para evitar refetch de parametros identicos
 * - Chamadas a API REST para BB84 e MDI-QKD
 *
 * @returns {UseSweepDataResult} Objeto contendo dados, estado de carregamento, erro e funcao runSweep
 *
 * @example
 * const { data, loading, error, runSweep } = useSweepData();
 *
 * const handleExecute = async () => {
 *   await runSweep("bb84", 0, 30, 15, {
 *     fiber_loss_db_km: 0.22,
 *     detector_efficiency: 0.8,
 *     dark_count_rate: 0.00001
 *   });
 * };
 */
export const useSweepData = (): UseSweepDataResult => {
  const [data, setData] = useState<SweepResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cache para armazenar resultados de varreduras anteriores.
   * Chave: JSON stringificado de parametros
   * Valor: Response da API
   */
  const cacheRef = useRef<
    Map<string, SweepResponse>
  >(new Map());

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
   * Executa uma varredura de distancia para um protocolo especifico.
   *
   * Comportamento:
   * - Verifica cache primeiro, retorna em memoria se encontrado
   * - Faz requisicao POST ao endpoint /sweep/{protocol}
   * - Converte parametros para snake_case (min_km, max_km, num_points)
   * - Armazena resultado em cache (LRU, maximo 20 entradas)
   * - Timeout de 30 segundos
   *
   * @param {string} protocol - Protocolo a simular: "bb84" ou "mdi-qkd"
   * @param {number} minKm - Distancia minima em km (0 para BB84, 0 para MDI-QKD)
   * @param {number} maxKm - Distancia maxima em km (30 para BB84, 100 para MDI-QKD)
   * @param {number} numPoints - Numero de pontos a calcular (2-50 recomendado)
   * @param {Record<string, number>} [additionalParams] - Parametros opcionais do protocolo
   *   Para BB84: fiber_loss_db_km, detector_efficiency, dark_count_rate
   *   Para MDI-QKD: fiber_loss_db_km, detection_efficiency, quantum_bit_error_rate
   *
   * @returns {Promise<SweepResponse | null>} Dados de varredura ou null em caso de erro
   */
  const runSweep = useCallback(
    async (
      protocol: "bb84" | "mdi-qkd",
      minKm: number,
      maxKm: number,
      numPoints: number,
      additionalParams?: Record<string, number>
    ): Promise<SweepResponse | null> => {
      const cacheKey = generateCacheKey(
        protocol,
        minKm,
        maxKm,
        numPoints,
        additionalParams
      );

      // Verifica cache em memoria
      if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        setData(cached || null);
        setError(null);
        return cached || null;
      }

      setLoading(true);
      setError(null);

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

        // Armazena em cache
        cacheRef.current.set(cacheKey, result);

        // Limpa cache se exceder limite (FIFO simples)
        if (cacheRef.current.size > 20) {
          const firstKey = cacheRef.current.keys().next()
            .value as string | undefined;
          if (firstKey !== undefined) {
            cacheRef.current.delete(firstKey);
          }
        }

        setData(result);
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
    runSweep,
  };
};
