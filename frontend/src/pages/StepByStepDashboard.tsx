import React, { useState, useCallback, useMemo } from "react";
import { useSimulationCache } from "../hooks/useSimulationCache";
import { StepByStepSimulationParams, ResultMetric } from "../types/stepbystep";
import ParametersPanel from "../components/ParametersPanel";
import StepsContainer from "../components/StepsContainer";
import ResultsPanel from "../components/ResultsPanel";
import ComparisonChart from "../components/ComparisonChart";

const COMMON_PARAMETERS = [
  { key: "distance_km", label: "Distancia", min: 0, max: 100, step: 1, unit: "km" },
  { key: "fiber_loss_db_km", label: "Fiber Loss", min: 0, max: 1, step: 0.01, unit: "dB/km" },
];
const BB84_PARAMETERS = [
  { ...COMMON_PARAMETERS[0], max: 30 }, COMMON_PARAMETERS[1],
  { key: "detector_efficiency", label: "Detector Efficiency", min: 0, max: 1, step: 0.01, unit: "" },
  { key: "dark_count_rate", label: "Dark Count Rate", min: 0, max: 0.001, step: 0.00001, unit: "", precision: 5 },
];
const MDI_QKD_PARAMETERS = [
  ...COMMON_PARAMETERS,
  { key: "detection_efficiency", label: "Detector Efficiency", min: 0, max: 1, step: 0.01, unit: "" },
  { key: "quantum_bit_error_rate", label: "QBER (fracao)", min: 0.05, max: 0.2, step: 0.01, unit: "" },
];
const RESULT_METRICS: ResultMetric[] = [
  {
    key: "secret_key_rate_bps",
    label: "Taxa de Chave Secreta",
    unit: "bps",
  },
  {
    key: "qber_percent",
    label: "Taxa de Erro Quantico",
    unit: "%",
  },
  {
    key: "transmissivity",
    label: "Transmissividade",
    unit: "adim",
  },
];

const StepByStepDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bb84" | "mdi-qkd">("bb84");

  const [bb84Params, setBb84Params] = useState<StepByStepSimulationParams>({
    distance_km: 10,
    fiber_loss_db_km: 0.22,
    dark_count_rate: 0.00001,
    detector_efficiency: 0.8,
  });

  const [mdiParams, setMdiParams] = useState<StepByStepSimulationParams>({
    distance_km: 10,
    fiber_loss_db_km: 0.22,
    quantum_bit_error_rate: 0.1,
    detection_efficiency: 0.8,
  });

  // Usar cache global para persistência entre abas
  const {
    data: bb84Data,
    loading: bb84Loading,
    error: bb84Error,
    isCached: bb84IsCached,
    cacheAgeSeconds: bb84CacheAge,
    runSimulation: runBB84,
  } = useSimulationCache("bb84_simulation");

  const {
    data: mdiData,
    loading: mdiLoading,
    error: mdiError,
    isCached: mdiIsCached,
    cacheAgeSeconds: mdiCacheAge,
    runSimulation: runMDI,
  } = useSimulationCache("mdi_qkd_simulation");

  const currentData = activeTab === "bb84" ? bb84Data : mdiData;
  const currentLoading = activeTab === "bb84" ? bb84Loading : mdiLoading;
  const currentError = activeTab === "bb84" ? bb84Error : mdiError;
  const currentIsCached = activeTab === "bb84" ? bb84IsCached : mdiIsCached;
  const currentCacheAge = activeTab === "bb84" ? bb84CacheAge : mdiCacheAge;
  const currentParams = activeTab === "bb84" ? bb84Params : mdiParams;
  const currentParameters =
    activeTab === "bb84" ? BB84_PARAMETERS : MDI_QKD_PARAMETERS;

  // O cache é gerenciado automaticamente pelo useSimulationCache
  // que valida se os parâmetros armazenados correspondem aos parâmetros atuais
  // Nenhuma limpeza manual necessária aqui

  const handleParameterChange = useCallback(
    (key: string, value: number) => {
      if (activeTab === "bb84") {
        setBb84Params((prev) => ({ ...prev, [key]: value }));
      } else {
        setMdiParams((prev) => ({ ...prev, [key]: value }));
      }
    },
    [activeTab]
  );

  const handleSimulate = useCallback(async () => {
    if (activeTab === "bb84") {
      await runBB84("bb84", bb84Params);
    } else {
      await runMDI("mdi-qkd", mdiParams);
    }
  }, [activeTab, bb84Params, mdiParams, runBB84, runMDI]);

  // Dados para o gráfico de comparação
  const comparisonData = useMemo(() => {
    if (!bb84Data || !mdiData) return [];

    return [
      {
        label: "Taxa de Chave (bps)",
        bb84: bb84Data.final_result.secret_key_rate_bps || 0,
        mdiQkd: mdiData.final_result.secret_key_rate_bps || 0,
      },
      {
        label: "QBER (%)",
        bb84: bb84Data.final_result.qber_percent || 0,
        mdiQkd: mdiData.final_result.qber_percent || 0,
      },
      {
        label: "Transmissividade",
        bb84: bb84Data.final_result.transmissivity || 0,
        mdiQkd: mdiData.final_result.transmissivity || 0,
      },
    ];
  }, [bb84Data, mdiData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simulador Quantico Passo a Passo
          </h1>
          <p className="text-gray-600">
            Explore os detalhes de cada calculo intermediario dos protocolos BB84 e MDI-QKD
          </p>
        </div>

        {/* Abas de Protocolo */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("bb84")}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === "bb84"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            BB84
          </button>
          <button
            onClick={() => setActiveTab("mdi-qkd")}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === "mdi-qkd"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            MDI-QKD
          </button>
        </div>

        {/* Badge de Cache */}
        {currentIsCached && currentCacheAge !== null && !currentLoading && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">
              Dados em cache há {currentCacheAge}s
            </span>
          </div>
        )}

        {/* Conteúdo da Aba Ativa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Painel de Parametros */}
          <div className="lg:col-span-1">
            <ParametersPanel
              title={activeTab === "bb84" ? "Parametros BB84" : "Parametros MDI-QKD"}
              parameters={currentParameters}
              values={currentParams}
              onChange={handleParameterChange}
              onSimulate={handleSimulate}
              loading={currentLoading}
            />
          </div>

          {/* Painel de Passos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <StepsContainer
                steps={currentData?.steps || []}
                loading={currentLoading}
                error={currentError}
              />
            </div>
          </div>

          {/* Painel de Resultados */}
          <div className="lg:col-span-1">
            <ResultsPanel
              title="Resultados Finais"
              results={currentData?.final_result || {}}
              metrics={RESULT_METRICS}
              loading={currentLoading}
              error={currentError}
              secondaryData={
                currentData
                  ? {
                      label: "Tempo de Execucao",
                      value: currentData.execution_time_ms,
                      unit: "ms",
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Grafico de Comparacao */}
        {bb84Data && mdiData && (
          <div className="mt-8">
            <ComparisonChart
              title="Comparacao entre Protocolos"
              data={comparisonData}
              yAxisLabel="Valor"
            />
          </div>
        )}

        {/* Mensagem Inicial */}
        {!currentData && !currentLoading && (
          <div className="text-center py-12">

            <p className="text-gray-600 text-lg font-medium">
              Clique em "Simular" para visualizar os passos de calculo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepByStepDashboard;
