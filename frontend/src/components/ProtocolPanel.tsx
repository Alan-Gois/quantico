import React, { useState, useCallback } from "react";
import ParameterInput from "./ParameterInput";
import MetricCard from "./MetricCard";
import DistanceSweepChart from "./DistanceSweepChart";
import { useSimulation, useSweep } from "../hooks/useSimulation";
import { ProtocolParameters } from "../types";

interface ProtocolPanelProps {
  protocol: "bb84" | "mdi-qkd";
  title: string;
  description: string;
  parameters: Record<string, { min: number; max: number; step: number; unit: string; default: number }>;
}

const ProtocolPanel: React.FC<ProtocolPanelProps> = ({
  protocol,
  title,
  description,
  parameters,
}) => {
  const [paramValues, setParamValues] = useState<Record<string, number>>(() =>
    Object.entries(parameters).reduce(
      (acc, [key, config]) => {
        acc[key] = config.default;
        return acc;
      },
      {} as Record<string, number>
    )
  );

  const { simulationData, simulationLoading, simulationError, runSimulation } =
    useSimulation();
  const { sweepData, sweepLoading, sweepError, runSweep } = useSweep();

  const handleParameterChange = useCallback(
    (paramName: string, value: number) => {
      setParamValues((prev) => ({
        ...prev,
        [paramName]: value,
      }));
    },
    []
  );

  const handleRunSimulation = useCallback(async () => {
    await runSimulation(protocol, paramValues as ProtocolParameters);
  }, [protocol, paramValues, runSimulation]);

  const handleRunSweep = useCallback(async () => {
    await runSweep(protocol, paramValues, 20, 100);
  }, [protocol, paramValues, runSweep]);

  const getSecurityStatus = (): "success" | "warning" | "error" => {
    if (!simulationData) return "neutral" as never;
    return simulationData.secure ? "success" : "error";
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Parâmetros</h3>

          {Object.entries(parameters).map(([key, config]) => (
            <ParameterInput
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
              value={paramValues[key]}
              min={config.min}
              max={config.max}
              step={config.step}
              unit={config.unit}
              onChange={(value) => handleParameterChange(key, value)}
              precision={2}
            />
          ))}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleRunSimulation}
              disabled={simulationLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {simulationLoading ? "Processando..." : "Simular"}
            </button>
            <button
              onClick={handleRunSweep}
              disabled={sweepLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sweepLoading ? "Processando..." : "Varrer"}
            </button>
          </div>

          {simulationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {simulationError}
            </div>
          )}

          {sweepError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {sweepError}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Resultados</h3>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="Taxa de Chave"
              value={
                simulationData
                  ? simulationData.key_rate.toFixed(4)
                  : "-- "
              }
              unit="bits/s"
              status={simulationData ? (simulationData.key_rate > 0 ? "success" : "warning") : "neutral"}
            />
            <MetricCard
              title="QBER"
              value={simulationData ? (simulationData.qber * 100).toFixed(2) : "-- "}
              unit="%"
              status={
                simulationData
                  ? simulationData.qber < 0.11
                    ? "success"
                    : "error"
                  : "neutral"
              }
            />
            <MetricCard
              title="Taxa Sift"
              value={simulationData ? simulationData.sift_rate.toFixed(4) : "-- "}
              unit="eventos/s"
              status="neutral"
            />
            <MetricCard
              title="Segurança"
              value={simulationData ? (simulationData.secure ? "Seguro" : "Inseguro") : "N/A"}
              status={getSecurityStatus()}
            />
          </div>
        </div>
      </div>

      <div>
        <DistanceSweepChart
          data={sweepData}
          loading={sweepLoading}
          error={sweepError}
        />
      </div>
    </div>
  );
};

export default ProtocolPanel;
