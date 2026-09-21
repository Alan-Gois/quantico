import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SweepResponse } from "../hooks/useSweepData";

/**
 * Grafico de barras comparando BB84 vs MDI-QKD em multiplas distancias.
 *
 * Caracteristicas:
 * - Compara Key Rate em 3 distancias selecionadas: 10km, 30km e 50km
 * - Barras lado a lado para cada protocolo
 * - Cores distintas: Azul (BB84), Roxo (MDI-QKD)
 * - Eixo Y em escala logaritmica para visualizar multiplas ordens de magnitude
 * - Info boxes explicando cada protocolo
 * - Altura fixa de 300px para layout estavel
 *
 * @component
 * @param {ComparisonSweepChartProps} props - Props do componente
 * @param {SweepResponse | null} props.bb84Data - Dados de varredura BB84
 * @param {SweepResponse | null} props.mdiData - Dados de varredura MDI-QKD
 * @param {boolean} props.loading - Indica se está carregando dados
 * @param {string | null} props.error - Mensagem de erro se houver
 *
 * @example
 * <ComparisonSweepChart
 *   bb84Data={bb84SweepData}
 *   mdiData={mdiSweepData}
 *   loading={isLoading}
 *   error={null}
 * />
 */
interface ComparisonSweepChartProps {
  bb84Data: SweepResponse | null;
  mdiData: SweepResponse | null;
  loading: boolean;
  error: string | null;
}

const ComparisonSweepChart: React.FC<ComparisonSweepChartProps> = ({
  bb84Data,
  mdiData,
  loading,
  error,
}) => {
  const comparisonData = useMemo(() => {
    if (!bb84Data?.data || !mdiData?.data) return [];

    const distances = [10, 30, 50];
    const result = [];
    const DISTANCE_MARGIN = 2.0; // Margem de 2 km para tolerar distribuicao desigual

    for (const distance of distances) {
      // Encontra o ponto mais proximo para BB84
      const bb84Point = bb84Data.data.reduce((closest, point) => {
        const diff = Math.abs(point.distance - distance);
        if (diff > DISTANCE_MARGIN) return closest;
        if (!closest || diff < Math.abs(closest.distance - distance)) {
          return point;
        }
        return closest;
      }, null as typeof bb84Data.data[0] | null);

      // Encontra o ponto mais proximo para MDI-QKD
      const mdiPoint = mdiData.data.reduce((closest, point) => {
        const diff = Math.abs(point.distance - distance);
        if (diff > DISTANCE_MARGIN) return closest;
        if (!closest || diff < Math.abs(closest.distance - distance)) {
          return point;
        }
        return closest;
      }, null as typeof mdiData.data[0] | null);

      // Adiciona ao resultado se encontrou pelo menos um ponto
      if (bb84Point || mdiPoint) {
        result.push({
          distance: `${distance}km`,
          bb84: bb84Point?.keyRate || 0,
          mdiQkd: mdiPoint?.keyRate || 0,
        });
      }
    }

    return result;
  }, [bb84Data, mdiData]);

  if (loading) {
    return (
      <div className="w-full h-80 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando dados de comparacao...</p>
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

  if (comparisonData.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Nenhum dado disponivel</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Comparacao BB84 vs MDI-QKD
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Taxa de chave em tres distancias selecionadas
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={comparisonData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="distance"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            scale="log"
            domain={[1, 1000000]}
            label={{
              value: "Taxa de Chave (bps, escala log)",
              angle: -90,
              position: "insideLeft",
              fill: "#374151",
              style: { fontSize: "11px" },
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
                if (value > 1000000) {
                  return (value / 1000000).toFixed(2) + " Mbps";
                } else if (value > 1000) {
                  return (value / 1000).toFixed(2) + " kbps";
                } else {
                  return value.toFixed(2) + " bps";
                }
              }
              return String(value);
            }}
            labelStyle={{ color: "#111827" }}
          />
          <Legend wrapperStyle={{ paddingTop: "16px" }} />
          <Bar
            dataKey="bb84"
            fill="#3b82f6"
            name="BB84"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="mdiQkd"
            fill="#8b5cf6"
            name="MDI-QKD"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm font-semibold text-blue-900">BB84</span>
          </div>
          <p className="text-xs text-blue-700">
            Protocolo determinista, distancia max 30km
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-sm font-semibold text-purple-900">
              MDI-QKD
            </span>
          </div>
          <p className="text-xs text-purple-700">
            Independente do dispositivo, distancia max 100km
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSweepChart;
