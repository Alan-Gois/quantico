import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SweepResponse, SweepDataPoint } from "../hooks/useSweepData";

/**
 * Grafico de linha duplo mostrando Key Rate vs Distancia e QBER.
 *
 * Caracteristicas:
 * - Eixo X: Distancia (km)
 * - Eixo Y (esquerda): Key Rate em escala logaritmica (bps)
 * - Eixo Y (direita): QBER em escala linear (%)
 * - Linhas: Verde (Key Rate), Vermelho (QBER)
 * - Animacao suave com duracao de 1000ms
 * - Cards de estatisticas abaixo do grafico
 * - Responsivo em desktop, tablet e mobile
 *
 * @component
 * @param {SweepChartProps} props - Props do componente
 * @param {SweepResponse | null} props.data - Dados de varredura (null = nao carregado)
 * @param {boolean} props.loading - Indica se está carregando dados
 * @param {string | null} props.error - Mensagem de erro se houver
 * @param {string} [props.title="Varredura de Distancia"] - Titulo do grafico
 * @param {"BB84" | "MDI-QKD"} [props.protocol="BB84"] - Protocolo sendo visualizado
 *
 * @example
 * <SweepChart
 *   data={sweepData}
 *   loading={isLoading}
 *   error={error}
 *   title="Analise BB84"
 *   protocol="BB84"
 * />
 */
interface SweepChartProps {
  data: SweepResponse | null;
  loading: boolean;
  error: string | null;
  title?: string;
  protocol?: "BB84" | "MDI-QKD";
}

const SweepChart: React.FC<SweepChartProps> = ({
  data,
  loading,
  error,
  title = "Varredura de Distancia",
  protocol = "BB84",
}) => {
  if (loading) {
    return (
      <div className="w-full h-96 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="text-red-700">
          <p className="font-semibold mb-1">Erro ao carregar grafico</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Nenhum dado disponivel</div>
      </div>
    );
  }

  const maxDistance = protocol === "BB84" ? 30 : 100;
  const xAxisLabel = `Distancia (km, 0-${maxDistance})`;

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Metricas de Key Rate e QBER ao longo da distancia para protocolo{" "}
          {protocol}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={data.data}
          margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="distance"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            label={{
              value: xAxisLabel,
              position: "insideBottomRight",
              offset: -10,
              fill: "#374151",
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="left"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            scale="log"
            domain={[1, 1000000]}
            label={{
              value: "Taxa de Chave (bps)",
              angle: -90,
              position: "insideLeft",
              fill: "#374151",
              style: { fontSize: "12px" },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            domain={[0, 10]}
            label={{
              value: "QBER (%)",
              angle: 90,
              position: "insideRight",
              fill: "#374151",
              style: { fontSize: "12px" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: number | string): string => {
              if (typeof value === "number") {
                if (value > 100000) {
                  return (value / 1000000).toFixed(2) + "M bps";
                } else if (value > 1000) {
                  return (value / 1000).toFixed(2) + "k bps";
                } else {
                  return value.toFixed(4);
                }
              }
              return String(value);
            }}
            labelStyle={{ color: "#111827" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            verticalAlign="top"
            height={36}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="keyRate"
            stroke="#10b981"
            strokeWidth={2}
            name="Taxa de Chave (bps)"
            dot={false}
            animationDuration={1000}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="qber"
            stroke="#ef4444"
            strokeWidth={2}
            name="QBER (%)"
            dot={false}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1">
            Taxa de Chave Max
          </p>
          <p className="text-sm font-bold text-green-900">
            {data.statistics.max_key_rate > 1000000
              ? (data.statistics.max_key_rate / 1000000).toFixed(2) + " Mbps"
              : (data.statistics.max_key_rate / 1000).toFixed(2) + " kbps"}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 font-semibold mb-1">
            QBER Max
          </p>
          <p className="text-sm font-bold text-red-900">
            {data.statistics.max_qber?.toFixed(2) || "N/A"}%
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold mb-1">
            Taxa Media
          </p>
          <p className="text-sm font-bold text-blue-900">
            {data.statistics.mean_key_rate > 1000000
              ? (data.statistics.mean_key_rate / 1000000).toFixed(2) + " Mbps"
              : (data.statistics.mean_key_rate / 1000).toFixed(2) + " kbps"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SweepChart;
