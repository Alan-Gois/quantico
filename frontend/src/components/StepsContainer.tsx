import React, { useState, useMemo } from "react";
import { CalculationStep } from "../types/stepbystep";
import StepCard from "./StepCard";

interface StepsContainerProps {
  steps: CalculationStep[];
  loading?: boolean;
  error?: string | null;
}

const StepsContainer: React.FC<StepsContainerProps> = ({
  steps,
  loading = false,
  error = null,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set(steps.length <= 3 ? steps.map((s) => s.step) : [])
  );

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const allStepsExpanded = useMemo(
    () => expandedSteps.size === steps.length,
    [expandedSteps.size, steps.length]
  );

  const toggleAllSteps = () => {
    if (allStepsExpanded) {
      setExpandedSteps(new Set());
    } else {
      setExpandedSteps(new Set(steps.map((s) => s.step)));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-sm font-semibold text-red-800">Erro ao carregar passos</p>
        <p className="text-xs text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
        <p className="text-sm text-gray-700">Nenhum passo disponivel</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          Passos de Calculo ({steps.length})
        </h3>
        <button
          onClick={toggleAllSteps}
          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          {allStepsExpanded ? "Recolher Todos" : "Expandir Todos"}
        </button>
      </div>

      <div className="relative">
        {/* Linha conectora visual */}
        <div className="absolute left-3 top-8 bottom-0 w-1 bg-gradient-to-b from-green-400 to-blue-400 rounded-full opacity-30" />

        {/* Cards dos passos */}
        <div className="space-y-3 relative z-10">
          {steps.map((step, index) => (
            <div
              key={step.step}
              style={{
                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <StepCard
                step={step}
                isCollapsed={!expandedSteps.has(step.step)}
                onToggle={() => toggleStep(step.step)}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StepsContainer;
