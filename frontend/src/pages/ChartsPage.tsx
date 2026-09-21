import React, { useState, useCallback } from "react";
import { useSweepCache } from "../hooks/useSweepCache";
import SweepChart from "../components/SweepChart";
import MetricsTimeline from "../components/MetricsTimeline";
import ComparisonSweepChart from "../components/ComparisonSweepChart";

const ChartsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bb84" | "mdi-qkd" | "comparison">("bb84");

  const bb84Sweep = useSweepCache("bb84");
  const mdiSweep = useSweepCache("mdi_qkd");
  const comparisonSweep1 = useSweepCache("comparison_bb84");
  const comparisonSweep2 = useSweepCache("comparison_mdi");

  const [bb84Params, setBb84Params] = useState({
    minKm: 0,
    maxKm: 30,
    numPoints: 15,
    fiberLoss: 0.22,
    detectorEfficiency: 0.8,
    darkCountRate: 0.00001,
  });

  const [mdiParams, setMdiParams] = useState({
    minKm: 0,
    maxKm: 100,
    numPoints: 20,
    fiberLoss: 0.22,
    detectionEfficiency: 0.8,
    quantumBitErrorRate: 0.1,
  });

  const handleBB84Sweep = useCallback(async () => {
    await bb84Sweep.runSweep("bb84", bb84Params.minKm, bb84Params.maxKm, bb84Params.numPoints, {
      fiber_loss_db_km: bb84Params.fiberLoss,
      detector_efficiency: bb84Params.detectorEfficiency,
      dark_count_rate: bb84Params.darkCountRate,
    });
  }, [bb84Sweep, bb84Params]);

  const handleBB84Recalculate = useCallback(async () => {
    await bb84Sweep.runSweep("bb84", bb84Params.minKm, bb84Params.maxKm, bb84Params.numPoints, {
      fiber_loss_db_km: bb84Params.fiberLoss,
      detector_efficiency: bb84Params.detectorEfficiency,
      dark_count_rate: bb84Params.darkCountRate,
    }, true);
  }, [bb84Sweep, bb84Params]);

  const handleMDISweep = useCallback(async () => {
    await mdiSweep.runSweep("mdi-qkd", mdiParams.minKm, mdiParams.maxKm, mdiParams.numPoints, {
      fiber_loss_db_km: mdiParams.fiberLoss,
      detection_efficiency: mdiParams.detectionEfficiency,
      quantum_bit_error_rate: mdiParams.quantumBitErrorRate,
    });
  }, [mdiSweep, mdiParams]);

  const handleMDIRecalculate = useCallback(async () => {
    await mdiSweep.runSweep("mdi-qkd", mdiParams.minKm, mdiParams.maxKm, mdiParams.numPoints, {
      fiber_loss_db_km: mdiParams.fiberLoss,
      detection_efficiency: mdiParams.detectionEfficiency,
      quantum_bit_error_rate: mdiParams.quantumBitErrorRate,
    }, true);
  }, [mdiSweep, mdiParams]);

  const handleComparisonSweep = useCallback(async () => {
    await comparisonSweep1.runSweep("bb84", bb84Params.minKm, bb84Params.maxKm, bb84Params.numPoints, {
      fiber_loss_db_km: bb84Params.fiberLoss,
      detector_efficiency: bb84Params.detectorEfficiency,
      dark_count_rate: bb84Params.darkCountRate,
    });

    await comparisonSweep2.runSweep(
      "mdi-qkd",
      mdiParams.minKm,
      mdiParams.maxKm,
      mdiParams.numPoints,
      {
        fiber_loss_db_km: mdiParams.fiberLoss,
        detection_efficiency: mdiParams.detectionEfficiency,
        quantum_bit_error_rate: mdiParams.quantumBitErrorRate,
      }
    );
  }, [
    comparisonSweep1,
    comparisonSweep2,
    bb84Params,
    mdiParams,
  ]);

  const handleComparisonRecalculate = useCallback(async () => {
    await comparisonSweep1.runSweep("bb84", bb84Params.minKm, bb84Params.maxKm, bb84Params.numPoints, {
      fiber_loss_db_km: bb84Params.fiberLoss,
      detector_efficiency: bb84Params.detectorEfficiency,
      dark_count_rate: bb84Params.darkCountRate,
    }, true);

    await comparisonSweep2.runSweep(
      "mdi-qkd",
      mdiParams.minKm,
      mdiParams.maxKm,
      mdiParams.numPoints,
      {
        fiber_loss_db_km: mdiParams.fiberLoss,
        detection_efficiency: mdiParams.detectionEfficiency,
        quantum_bit_error_rate: mdiParams.quantumBitErrorRate,
      },
      true
    );
  }, [
    comparisonSweep1,
    comparisonSweep2,
    bb84Params,
    mdiParams,
  ]);

  const formatCacheAge = (seconds: number | null): string => {
    if (seconds === null) return "";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Graficos de Varredura de Distancia
          </h1>
          <p className="text-gray-600">
            Visualize como as metricas quanricas variam ao longo da distancia para
            BB84 e MDI-QKD
          </p>
        </div>

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
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === "comparison"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Comparacao
          </button>
        </div>

        {activeTab === "bb84" && (
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Parametros BB84
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distancia Minima (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={bb84Params.minKm}
                    onChange={(e) =>
                      setBb84Params((prev) => ({
                        ...prev,
                        minKm: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distancia Maxima (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={bb84Params.maxKm}
                    onChange={(e) =>
                      setBb84Params((prev) => ({
                        ...prev,
                        maxKm: parseFloat(e.target.value) || 30,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero de Pontos
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={bb84Params.numPoints}
                    onChange={(e) =>
                      setBb84Params((prev) => ({
                        ...prev,
                        numPoints: parseInt(e.target.value) || 15,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiber Loss (dB/km)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={bb84Params.fiberLoss}
                    onChange={(e) =>
                      setBb84Params((prev) => ({
                        ...prev,
                        fiberLoss: parseFloat(e.target.value) || 0.22,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detector Efficiency
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={bb84Params.detectorEfficiency}
                    onChange={(e) =>
                      setBb84Params((prev) => ({
                        ...prev,
                        detectorEfficiency: parseFloat(e.target.value) || 0.8,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dark Count Rate
                  </label>
                  <input
                    type="number"
                    min="1e-6"
                    max="1e-3"
                    step="1e-5"
                    value={bb84Params.darkCountRate}
                    onChange={(e) =>
                      setBb84Params((prev) => ({
                        ...prev,
                        darkCountRate: parseFloat(e.target.value) || 0.00001,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={handleBB84Sweep}
                  disabled={bb84Sweep.loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {bb84Sweep.loading ? "Carregando..." : "Gerar Varredura BB84"}
                </button>
                {bb84Sweep.isCached && bb84Sweep.data && (
                  <button
                    onClick={handleBB84Recalculate}
                    disabled={bb84Sweep.loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    Recalcular
                  </button>
                )}
                {bb84Sweep.isCached && bb84Sweep.data && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Dados do cache {formatCacheAge(bb84Sweep.cacheAgeSeconds)}
                  </div>
                )}
              </div>
            </div>

            <SweepChart
              data={bb84Sweep.data}
              loading={bb84Sweep.loading}
              error={bb84Sweep.error}
              title="Varredura de Distancia - BB84"
              protocol="BB84"
            />

            <MetricsTimeline
              data={bb84Sweep.data}
              loading={bb84Sweep.loading}
              error={bb84Sweep.error}
              title="Evolucao de Metricas - BB84"
              protocol="BB84"
            />
          </div>
        )}

        {activeTab === "mdi-qkd" && (
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Parametros MDI-QKD
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distancia Minima (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mdiParams.minKm}
                    onChange={(e) =>
                      setMdiParams((prev) => ({
                        ...prev,
                        minKm: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distancia Maxima (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mdiParams.maxKm}
                    onChange={(e) =>
                      setMdiParams((prev) => ({
                        ...prev,
                        maxKm: parseFloat(e.target.value) || 100,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero de Pontos
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={mdiParams.numPoints}
                    onChange={(e) =>
                      setMdiParams((prev) => ({
                        ...prev,
                        numPoints: parseInt(e.target.value) || 20,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiber Loss (dB/km)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={mdiParams.fiberLoss}
                    onChange={(e) =>
                      setMdiParams((prev) => ({
                        ...prev,
                        fiberLoss: parseFloat(e.target.value) || 0.22,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detection Efficiency
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={mdiParams.detectionEfficiency}
                    onChange={(e) =>
                      setMdiParams((prev) => ({
                        ...prev,
                        detectionEfficiency: parseFloat(e.target.value) || 0.8,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantum Bit Error Rate
                  </label>
                  <input
                    type="number"
                    min="0.05"
                    max="0.2"
                    step="0.01"
                    value={mdiParams.quantumBitErrorRate}
                    onChange={(e) =>
                      setMdiParams((prev) => ({
                        ...prev,
                        quantumBitErrorRate: parseFloat(e.target.value) || 0.1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={handleMDISweep}
                  disabled={mdiSweep.loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {mdiSweep.loading ? "Carregando..." : "Gerar Varredura MDI-QKD"}
                </button>
                {mdiSweep.isCached && mdiSweep.data && (
                  <button
                    onClick={handleMDIRecalculate}
                    disabled={mdiSweep.loading}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    Recalcular
                  </button>
                )}
                {mdiSweep.isCached && mdiSweep.data && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Dados do cache {formatCacheAge(mdiSweep.cacheAgeSeconds)}
                  </div>
                )}
              </div>
            </div>

            <SweepChart
              data={mdiSweep.data}
              loading={mdiSweep.loading}
              error={mdiSweep.error}
              title="Varredura de Distancia - MDI-QKD"
              protocol="MDI-QKD"
            />

            <MetricsTimeline
              data={mdiSweep.data}
              loading={mdiSweep.loading}
              error={mdiSweep.error}
              title="Evolucao de Metricas - MDI-QKD"
              protocol="MDI-QKD"
            />
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Gerar Comparacao
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Clique no botao abaixo para gerar varreduras de ambos os protocolos
                simultaneamente usando os parametros configurados nas abas anteriores.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={handleComparisonSweep}
                  disabled={comparisonSweep1.loading || comparisonSweep2.loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {comparisonSweep1.loading || comparisonSweep2.loading
                    ? "Carregando..."
                    : "Gerar Ambas Varreduras"}
                </button>
                {comparisonSweep1.isCached && comparisonSweep1.data && (
                  <button
                    onClick={handleComparisonRecalculate}
                    disabled={comparisonSweep1.loading || comparisonSweep2.loading}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    Recalcular Ambas
                  </button>
                )}
                {(comparisonSweep1.isCached || comparisonSweep2.isCached) && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    {comparisonSweep1.isCached && comparisonSweep2.isCached
                      ? `Ambas do cache ${formatCacheAge(Math.max(comparisonSweep1.cacheAgeSeconds || 0, comparisonSweep2.cacheAgeSeconds || 0))}`
                      : "Parcialmente em cache"}
                  </div>
                )}
              </div>
            </div>

            <ComparisonSweepChart
              bb84Data={comparisonSweep1.data}
              mdiData={comparisonSweep2.data}
              loading={comparisonSweep1.loading || comparisonSweep2.loading}
              error={comparisonSweep1.error || comparisonSweep2.error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsPage;
