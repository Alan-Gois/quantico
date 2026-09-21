import React from "react";
import ParameterInput from "./ParameterInput";

interface ParameterConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  precision?: number;
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

          {title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ajuste os parametros e clique em Simular
        </p>
      </div>

      <div className="space-y-3">
        {parameters.map((param) => (
          <ParameterInput
            key={param.key}
            label={param.label}
            value={values[param.key] ?? param.min}
            min={param.min}
            max={param.max}
            step={param.step}
            unit={param.unit}
            onChange={(newValue) => onChange(param.key, newValue)}
            precision={param.precision ?? 2}
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

              Simulando...
            </>
          ) : (
            <>

              Simular
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ParametersPanel;
