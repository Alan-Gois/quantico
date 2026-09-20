import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ComparisonData {
  label: string;
  bb84: number;
  mdiQkd: number;
}

interface ComparisonChartProps {
  title: string;
  data: ComparisonData[];
  yAxisLabel?: string;
  loading?: boolean;
  error?: string | null;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  title,
  data,
  yAxisLabel = "Valor",
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-800">Erro ao carregar grafico</p>
        <p className="text-xs text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <p className="text-sm text-gray-700">Nenhum dado disponivel</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
          {title}
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: unknown) => {
              if (typeof value === "number") {
                return value.toFixed(2);
              }
              return value;
            }}
            labelStyle={{ color: "#111827" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            iconType="square"
          />
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-xs font-medium text-blue-900">BB84</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span className="text-xs font-medium text-purple-900">MDI-QKD</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;
