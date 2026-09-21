/**
 * Teste de integração para validar o mapeamento de dados da API
 * até a renderização nos gráficos.
 *
 * Cenário: API retorna dados em snake_case, frontend transforma para camelCase
 */

import { transformSweepData } from "../../utils/sweepDataTransformer";
import { SweepDataPoint } from "../../hooks/useSweepData";

describe("Sweep Data Mapping Integration", () => {
  describe("API Response to Chart Data Flow", () => {
    it("should correctly map 30 data points from API format to chart format", () => {
      // Simula resposta com 30 pontos como mencionado no relatório
      const rawApiResponse = Array.from({ length: 30 }, (_, i) => ({
        distance_km: (i * 3.33),
        secret_key_rate_bps: 23210269.0 * Math.exp(-i * 0.05),
        qber_percent: 1.0 + (i * 0.15),
        transmissivity: 0.592 * Math.exp(-i * 0.05),
      }));

      const chartData = transformSweepData(rawApiResponse);

      // Validações
      expect(chartData).toHaveLength(30);
      expect(chartData[0]).toEqual({
        distance: 0,
        keyRate: 23210269,
        qber: 1.0,
        transmissivity: 0.592,
      });
    });

    it("should have all required fields for Recharts rendering", () => {
      const rawPoint = {
        distance_km: 10.34,
        secret_key_rate_bps: 23210269.0,
        qber_percent: 1.0,
        transmissivity: 0.592,
      };

      const transformed = transformSweepData([rawPoint])[0] as SweepDataPoint;

      // Campos necessários para Recharts
      expect(transformed).toHaveProperty("distance");
      expect(transformed).toHaveProperty("keyRate");
      expect(transformed).toHaveProperty("qber");
      expect(transformed).toHaveProperty("transmissivity");

      // Validação de tipos
      expect(typeof transformed.distance).toBe("number");
      expect(typeof transformed.keyRate).toBe("number");
      expect(typeof transformed.qber).toBe("number");
      expect(typeof transformed.transmissivity).toBe("number");
    });

    it("should maintain data integrity through transformation", () => {
      const apiData = [
        {
          distance_km: 5.5,
          secret_key_rate_bps: 50000000.75,
          qber_percent: 2.5,
          transmissivity: 0.75,
        },
        {
          distance_km: 15.75,
          secret_key_rate_bps: 25000000.25,
          qber_percent: 3.25,
          transmissivity: 0.5625,
        },
        {
          distance_km: 25.2,
          secret_key_rate_bps: 12500000.5,
          qber_percent: 4.5,
          transmissivity: 0.421875,
        },
      ];

      const transformed = transformSweepData(apiData);

      // Validações de integridade
      transformed.forEach((point, idx) => {
        const original = apiData[idx];

        // Distance é mapeado diretamente
        expect(point.distance).toEqual(original.distance_km);

        // keyRate é arredondado mas próximo
        expect(Math.abs(point.keyRate - original.secret_key_rate_bps)).toBeLessThan(1);

        // qber é mapeado diretamente
        expect(point.qber).toEqual(original.qber_percent);

        // transmissivity é mapeado diretamente
        expect(point.transmissivity).toEqual(original.transmissivity);
      });
    });

    it("should handle edge cases at boundaries", () => {
      const edgeCases = [
        {
          distance_km: 0,
          secret_key_rate_bps: 1000000,
          qber_percent: 0.1,
          transmissivity: 1.0,
        },
        {
          distance_km: 100,
          secret_key_rate_bps: 100,
          qber_percent: 10,
          transmissivity: 0.0,
        },
        {
          distance_km: 50.5,
          secret_key_rate_bps: 999999999,
          qber_percent: 5.5,
          transmissivity: 0.5,
        },
      ];

      const transformed = transformSweepData(edgeCases);

      // Validar que não há undefined, null ou NaN
      transformed.forEach((point) => {
        expect(isFinite(point.distance)).toBe(true);
        expect(isFinite(point.keyRate)).toBe(true);
        expect(isFinite(point.qber)).toBe(true);
        expect(isFinite(point.transmissivity)).toBe(true);
      });
    });

    it("should produce data suitable for XAxis and YAxis rendering", () => {
      const rawData = [
        {
          distance_km: 0,
          secret_key_rate_bps: 1000000,
          qber_percent: 0.5,
          transmissivity: 1.0,
        },
        {
          distance_km: 10,
          secret_key_rate_bps: 500000,
          qber_percent: 1.0,
          transmissivity: 0.5,
        },
        {
          distance_km: 20,
          secret_key_rate_bps: 100000,
          qber_percent: 2.5,
          transmissivity: 0.25,
        },
      ];

      const chartData = transformSweepData(rawData);

      // XAxis esperado usar 'distance'
      const distances = chartData.map((p) => p.distance);
      expect(distances).toEqual([0, 10, 20]);

      // YAxis esquerda esperado usar 'keyRate'
      const keyRates = chartData.map((p) => p.keyRate);
      expect(keyRates).toEqual([1000000, 500000, 100000]);

      // YAxis direita esperado usar 'qber'
      const qbers = chartData.map((p) => p.qber);
      expect(qbers).toEqual([0.5, 1.0, 2.5]);
    });
  });
});
