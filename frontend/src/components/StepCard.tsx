import React, { useState } from "react";
import { CalculationStep } from "../types/stepbystep";

interface StepCardProps {
  step: CalculationStep;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  isCollapsed = false,
  onToggle,
}) => {
  const [localExpanded, setExpanded] = useState(!isCollapsed);
  const expanded = onToggle ? !isCollapsed : localExpanded;

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  // Calcular cor do gradiente baseado no número do passo
  const gradientIntensity = Math.min((step.step / 10) * 255, 220);
  const bgColor = `rgba(34, 197, 94, ${0.1 + (step.step / 10) * 0.2})`;
  const borderColor =
    step.status === "completed"
      ? "border-green-400"
      : "border-red-400";

  const statusBgColor =
    step.status === "completed"
      ? "bg-green-100"
      : "bg-red-100";
  const statusTextColor =
    step.status === "completed"
      ? "text-green-800"
      : "text-red-800";

  return (
    <div
      className={`rounded-lg border-2 ${borderColor} overflow-hidden transition-all duration-300 ease-in-out`}
      style={{ backgroundColor: bgColor }}
    >
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold">
            {step.step}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {step.name}
          </span>
        </div>

      </button>

      {expanded && (
        <div className="border-t-2 border-gray-200 px-6 py-4 space-y-3 bg-white bg-opacity-80">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Formula
            </label>
            <code className="block p-2 bg-gray-100 rounded text-sm text-gray-800 font-mono overflow-x-auto">
              {step.formula}
            </code>
          </div>

          {Object.keys(step.variables).length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Variaveis de Entrada
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(step.variables).map(([key, value]) => (
                  <div key={key} className="bg-blue-50 p-2 rounded border border-blue-200">
                    <span className="font-mono text-sm font-semibold text-blue-900">
                      {key}
                    </span>
                    <div className="text-xs text-blue-700 font-medium mt-1">
                      {typeof value === "number"
                        ? value.toFixed(4)
                        : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Resultado
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBgColor} ${statusTextColor}`}>
                {step.status === "completed"
                  ? "Concluído"
                  : "Erro"}
              </span>
            </div>
            <div className="flex items-baseline gap-2 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded">
              <span className="text-2xl font-bold text-green-700">
                {step.result.toFixed(6)}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {step.unit}
              </span>
            </div>
          </div>

          {step.description && (
            <div className="border-t pt-3 space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Descricao
              </label>
              <p className="text-sm text-gray-700 italic">{step.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepCard;
