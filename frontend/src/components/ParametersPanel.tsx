import React from "react";
import ParameterInput from "./ParameterInput";

interface ParameterConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

interface ParametersPanelProps {
  title: string;
  parameters: ParameterConfig[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onSimulate?: () => void;
  loading?: boolean;
}

const ParametersPanel: React.FC<ParametersPanelProps> = ({
  title,
  parameters,
  values,
  onChange,
  onSimulate,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.127c-1.117-1.33-3.077-.209-2.95 1.453.222 1.461-.926 2.752-2.236 2.752-1.623 0-2.298 2.199-.11 3.251 1.313.667 1.958 2.24.856 3.607-.27.35-.273.91.008 1.1.28.19.783.227 1.139.053 1.711-.591 3.447.529 3.726 2.257.278 1.74 2.123 2.773 3.488 1.986.564-.316 1.08.283 1.226.785.207.723 1.491.81 1.906.086.515-.85 1.492-.545 1.517.566.03 1.466 1.909 2.305 3.088 1.747.557-.316 1.185.174 1.141.827-.06.923 1.126 1.457 1.926.743.39-.38 1.203-.15 1.09.645-.127.987 1.283 1.352 1.932.57.382-.408 1.268.099 1.021.731-.347.873.088 1.844.985 1.877.896.035 1.631 1.073 1.23 1.93-.215.552.15 1.276.837 1.335.687.06 1.293.923 1.085 1.571"
              clipRule="evenodd"
            />
          </svg>
          {title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ajuste os parametros de entrada para atualizar a simulacao em tempo real
        </p>
      </div>

      <div className="space-y-3">
        {parameters.map((param) => (
          <ParameterInput
            key={param.key}
            label={param.label}
            value={values[param.key] || param.min}
            min={param.min}
            max={param.max}
            step={param.step}
            unit={param.unit}
            onChange={(newValue) => onChange(param.key, newValue)}
            precision={2}
          />
        ))}
      </div>

      {onSimulate && (
        <button
          onClick={onSimulate}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Simulando...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Simular
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ParametersPanel;
