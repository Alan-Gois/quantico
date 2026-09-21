import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SweepResponse } from "../hooks/useSweepData";

/**
 * Grafico de area duplo mostrando evolucao de Key Rate e Transmissividade com distancia.
 *
 * Caracteristicas:
 * - Eixo X: Distancia (km)
 * - Eixo Y (esquerda): Key Rate em escala logaritmica (bps)
 * - Eixo Y (direita): Transmissividade em percentual (%)
 * - Areas preenchidas com gradientes de cores (Azul e Roxo)
 * - Animacao de area com duracao de 1000ms
 * - Info box explicando escala logaritmica
 * - Responsivo em todos os dispositivos
 *
 * @component
 * @param {MetricsTimelineProps} props - Props do componente
 * @param {SweepResponse | null} props.data - Dados de varredura
 * @param {boolean} props.loading - Estado de carregamento
 * @param {string | null} props.error - Mensagem de erro
 * @param {string} [props.title="Evolucao de Taxa de Chave"] - Titulo do grafico
 * @param {"BB84" | "MDI-QKD"} [props.protocol="BB84"] - Protocolo sendo visualizado
 *
 * @example
 * <MetricsTimeline
 *   data={sweepData}
 *   loading={false}
 *   error={null}
 *   protocol="MDI-QKD"
 * />
 */
interface MetricsTimelineProps {
  data: SweepResponse | null;
  loading: boolean;
  error: string | null;
  title?: string;
  protocol?: "BB84" | "MDI-QKD";
}

const MetricsTimeline: React.FC<MetricsTimelineProps> = ({
  data,
  loading,
  error,
  title = "Evolucao de Taxa de Chave",
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

  const chartData = data.data.map((point) => ({
    distance: point.distance,
    keyRate: Math.max(point.keyRate, 1),
    transmissivity: point.transmissivity * 100,
  }));

  const maxDistance = protocol === "BB84" ? 30 : 100;

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Visualizacao da evolucao de taxa de chave conforme aumenta a
          distancia
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="distance"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            label={{
              value: `Distancia (km, 0-${maxDistance})`,
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
            domain={[0, 100]}
            label={{
              value: "Transmissividade (%)",
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
                  return (value / 1000000).toFixed(2) + "M";
                } else if (value > 1000) {
                  return (value / 1000).toFixed(2) + "k";
                } else {
                  return value.toFixed(2);
                }
              }
              return String(value);
            }}
            labelStyle={{ color: "#111827" }}
          />
          <Legend wrapperStyle={{ paddingTop: "16px" }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="keyRate"
            stroke="#3b82f6"
            fillOpacity={0.3}
            fill="#3b82f6"
            name="Taxa de Chave (bps)"
            animationDuration={1000}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="transmissivity"
            stroke="#8b5cf6"
            fillOpacity={0.3}
            fill="#8b5cf6"
            name="Transmissividade (%)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Escala Logaritmica:</strong> O eixo Y da taxa de chave
          utiliza escala logaritmica para melhor visualizacao da dinamica em
          diferentes ordens de magnitude.
        </p>
      </div>
    </div>
  );
};

export default MetricsTimeline;
