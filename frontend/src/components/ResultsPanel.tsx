import React from "react";
import MetricCard from "./MetricCard";

interface ResultMetric {
  key: string;
  label: string;
  unit: string;
  formatter?: (value: number) => string;
}

interface ResultsPanelProps {
  title: string;
  results: Record<string, number>;
  metrics: ResultMetric[];
  loading?: boolean;
  error?: string | null;
  secondaryData?: {
    label: string;
    value: number;
    unit: string;
  };
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  title,
  results,
  metrics,
  loading = false,
  error = null,
  secondaryData,
}) => {
  const getMetricStatus = (key: string, value: number) => {
    // Status baseado em ranges típicos de QKD
    if (key.includes("key_rate")) {
      if (value > 1e6) return "success";
      if (value > 1e5) return "warning";
      return "error";
    }
    if (key.includes("qber")) {
      if (value < 1.2) return "success";
      if (value < 2.0) return "warning";
      return "error";
    }
    if (key.includes("transmissivity")) {
      if (value > 0.5) return "success";
      if (value > 0.3) return "warning";
      return "error";
    }
    return "neutral";
  };

  const formatValue = (metric: ResultMetric, value: number) => {
    if (metric.formatter) {
      return metric.formatter(value);
    }

    // Formatação automática por unidade
    if (
      metric.unit.includes("bps") ||
      metric.unit.includes("Hz")
    ) {
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}G`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(2)}k`;
      return value.toFixed(2);
    }

    if (metric.unit.includes("%")) {
      return value.toFixed(2);
    }

    if (metric.unit.includes("dB")) {
      return value.toFixed(2);
    }

    return value.toFixed(4);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-800">Erro ao carregar resultados</p>
        <p className="text-xs text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          {title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Metricas finais da simulacao
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {metrics.map((metric) => {
          const value = results[metric.key];
          if (value === undefined) return null;

          return (
            <MetricCard
              key={metric.key}
              title={metric.label}
              value={formatValue(metric, value)}
              unit={metric.unit}
              status={getMetricStatus(metric.key, value) as any}
            />
          );
        })}
      </div>

      {secondaryData && (
        <div className="border-t pt-4">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Tempo de Execucao
          </div>
          <div className="flex items-baseline gap-2 p-3 bg-gray-50 rounded border border-gray-200">
            <span className="text-sm font-bold text-gray-900">
              {secondaryData.value.toFixed(2)}
            </span>
            <span className="text-xs text-gray-600">{secondaryData.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
