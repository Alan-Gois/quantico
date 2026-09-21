/**
 * Utilitário para transformar dados retornados pela API para o formato esperado pelo frontend.
 *
 * A API retorna dados em snake_case com nomes específicos:
 * - distance_km
 * - secret_key_rate_bps
 * - qber_percent
 * - transmissivity
 *
 * O frontend espera camelCase:
 * - distance
 * - keyRate
 * - qber
 * - transmissivity
 */

/**
 * Representa um ponto bruto retornado pela API.
 */
interface RawSweepDataPoint {
  distance_km: number;
  secret_key_rate_bps: number;
  qber_percent: number;
  transmissivity: number;
}

/**
 * Transforma um ponto de dados individual da API para o formato esperado.
 *
 * Mapeia os campos:
 * - distance_km -> distance
 * - secret_key_rate_bps -> keyRate
 * - qber_percent -> qber
 * - transmissivity -> transmissivity (sem alteração)
 *
 * @param rawPoint Ponto bruto da API
 * @returns Ponto transformado pronto para renderização
 */
export const transformSweepDataPoint = (
  rawPoint: RawSweepDataPoint
): {
  distance: number;
  keyRate: number;
  qber: number;
  transmissivity: number;
} => {
  return {
    distance: rawPoint.distance_km,
    keyRate: Math.round(rawPoint.secret_key_rate_bps),
    qber: rawPoint.qber_percent,
    transmissivity: rawPoint.transmissivity,
  };
};

/**
 * Transforma um array de pontos de dados da API.
 *
 * @param rawData Array de pontos brutos da API
 * @returns Array de pontos transformados
 */
export const transformSweepData = (
  rawData: RawSweepDataPoint[]
): Array<{
  distance: number;
  keyRate: number;
  qber: number;
  transmissivity: number;
}> => {
  return rawData.map(transformSweepDataPoint);
};

/**
 * Tipo genérico para resposta bruta da API antes da transformação.
 */
export interface RawSweepResponse {
  protocol: string;
  data: RawSweepDataPoint[];
  statistics: {
    max_key_rate: number;
    min_key_rate: number;
    mean_key_rate: number;
    max_qber?: number;
    min_qber?: number;
  };
}
