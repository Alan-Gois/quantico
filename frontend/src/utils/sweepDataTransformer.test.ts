import {
  transformSweepDataPoint,
  transformSweepData,
} from "./sweepDataTransformer";

describe("sweepDataTransformer", () => {
  describe("transformSweepDataPoint", () => {
    it("should transform a single data point correctly", () => {
      const rawPoint = {
        distance_km: 10.34,
        secret_key_rate_bps: 23210269.0,
        qber_percent: 1.0,
        transmissivity: 0.592,
      };

      const result = transformSweepDataPoint(rawPoint);

      expect(result).toEqual({
        distance: 10.34,
        keyRate: 23210269,
        qber: 1.0,
        transmissivity: 0.592,
      });
    });

    it("should handle rounding of keyRate correctly", () => {
      const rawPoint = {
        distance_km: 5.5,
        secret_key_rate_bps: 1234567.8,
        qber_percent: 2.5,
        transmissivity: 0.8,
      };

      const result = transformSweepDataPoint(rawPoint);

      expect(result.keyRate).toBe(1234568);
      expect(result.distance).toBe(5.5);
      expect(result.qber).toBe(2.5);
    });

    it("should preserve transmissivity unchanged", () => {
      const rawPoint = {
        distance_km: 0,
        secret_key_rate_bps: 100000,
        qber_percent: 0.5,
        transmissivity: 0.999,
      };

      const result = transformSweepDataPoint(rawPoint);

      expect(result.transmissivity).toBe(0.999);
    });

    it("should handle edge cases with zero values", () => {
      const rawPoint = {
        distance_km: 0,
        secret_key_rate_bps: 0,
        qber_percent: 0,
        transmissivity: 0,
      };

      const result = transformSweepDataPoint(rawPoint);

      expect(result).toEqual({
        distance: 0,
        keyRate: 0,
        qber: 0,
        transmissivity: 0,
      });
    });
  });

  describe("transformSweepData", () => {
    it("should transform an array of data points", () => {
      const rawData = [
        {
          distance_km: 10.34,
          secret_key_rate_bps: 23210269.0,
          qber_percent: 1.0,
          transmissivity: 0.592,
        },
        {
          distance_km: 20.68,
          secret_key_rate_bps: 5842567.2,
          qber_percent: 2.5,
          transmissivity: 0.296,
        },
        {
          distance_km: 30.0,
          secret_key_rate_bps: 1000000.0,
          qber_percent: 5.0,
          transmissivity: 0.148,
        },
      ];

      const result = transformSweepData(rawData);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        distance: 10.34,
        keyRate: 23210269,
        qber: 1.0,
        transmissivity: 0.592,
      });
      expect(result[1]).toEqual({
        distance: 20.68,
        keyRate: 5842567,
        qber: 2.5,
        transmissivity: 0.296,
      });
      expect(result[2]).toEqual({
        distance: 30.0,
        keyRate: 1000000,
        qber: 5.0,
        transmissivity: 0.148,
      });
    });

    it("should handle empty array", () => {
      const result = transformSweepData([]);

      expect(result).toEqual([]);
    });

    it("should handle array with single element", () => {
      const rawData = [
        {
          distance_km: 15.5,
          secret_key_rate_bps: 12345678.9,
          qber_percent: 1.5,
          transmissivity: 0.5,
        },
      ];

      const result = transformSweepData(rawData);

      expect(result).toHaveLength(1);
      expect(result[0].distance).toBe(15.5);
      expect(result[0].keyRate).toBe(12345679);
    });

    it("should maintain order of elements", () => {
      const rawData = [
        {
          distance_km: 1,
          secret_key_rate_bps: 1000000,
          qber_percent: 0.1,
          transmissivity: 0.9,
        },
        {
          distance_km: 2,
          secret_key_rate_bps: 2000000,
          qber_percent: 0.2,
          transmissivity: 0.8,
        },
        {
          distance_km: 3,
          secret_key_rate_bps: 3000000,
          qber_percent: 0.3,
          transmissivity: 0.7,
        },
      ];

      const result = transformSweepData(rawData);

      expect(result[0].distance).toBe(1);
      expect(result[1].distance).toBe(2);
      expect(result[2].distance).toBe(3);
    });

    it("should handle large values correctly", () => {
      const rawData = [
        {
          distance_km: 100,
          secret_key_rate_bps: 999999999.99,
          qber_percent: 10,
          transmissivity: 0.001,
        },
      ];

      const result = transformSweepData(rawData);

      expect(result[0].keyRate).toBe(1000000000);
      expect(result[0].distance).toBe(100);
    });
  });
});
