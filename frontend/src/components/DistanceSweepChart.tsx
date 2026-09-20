import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { SweepResult } from "../types";

interface DistanceSweepChartProps {
  data: SweepResult | null;
  loading: boolean;
  error: string | null;
}

const DistanceSweepChart: React.FC<DistanceSweepChartProps> = ({
  data,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="w-full h-96 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Carregando dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
        <div className="text-red-700 text-center">
          <p className="font-semibold">Erro ao carregar gráfico</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.distances || data.distances.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Nenhum dado disponível</div>
      </div>
    );
  }

  const chartData = data.distances.map((distance, index) => ({
    distance,
    keyRate: data.key_rates ? data.key_rates[index] : 0,
    qber: data.qbers ? data.qbers[index] : 0,
    siftRate: data.sift_rates ? data.sift_rates[index] : 0,
    secure: data.secure_ranges ? data.secure_ranges[index] : false,
  }));

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Varredura de Distância (20-100 km)
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="distance"
            label={{ value: "Distância (km)", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis yAxisId="left" label={{ value: "Taxa de Chave (bits/s)", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "QBER (%)", angle: 90, position: "insideRight" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
            formatter={(value) => {
              if (typeof value === "number") {
                return value.toFixed(4);
              }
              return value;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="keyRate"
            stroke="#0ea5e9"
            name="Taxa de Chave"
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="qber"
            stroke="#f59e0b"
            name="QBER"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <p>
          <strong>Taxa de Chave:</strong> Bits por segundo obtidos após processamento (azul)
        </p>
        <p>
          <strong>QBER:</strong> Taxa de erro quântico em bits (laranja)
        </p>
      </div>
    </div>
  );
};

export default DistanceSweepChart;
