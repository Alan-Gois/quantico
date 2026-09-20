import React, { useState } from "react";
import ProtocolPanel from "../components/ProtocolPanel";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bb84" | "mdi-qkd">("bb84");

  const bb84Parameters = {
    distance_km: {
      min: 0,
      max: 100,
      step: 1,
      unit: "km",
      default: 50,
    },
    error_rate: {
      min: 0,
      max: 0.2,
      step: 0.01,
      unit: "",
      default: 0.01,
    },
    efficiency: {
      min: 0.1,
      max: 1.0,
      step: 0.05,
      unit: "",
      default: 0.85,
    },
    basis_choice_error: {
      min: 0,
      max: 0.1,
      step: 0.005,
      unit: "",
      default: 0.02,
    },
    detector_efficiency: {
      min: 0.1,
      max: 1.0,
      step: 0.05,
      unit: "",
      default: 0.9,
    },
  };

  const mdiQkdParameters = {
    distance_km: {
      min: 0,
      max: 100,
      step: 1,
      unit: "km",
      default: 50,
    },
    error_rate: {
      min: 0,
      max: 0.2,
      step: 0.01,
      unit: "",
      default: 0.01,
    },
    efficiency: {
      min: 0.1,
      max: 1.0,
      step: 0.05,
      unit: "",
      default: 0.85,
    },
    twin_photon_rate: {
      min: 0,
      max: 1.0,
      step: 0.05,
      unit: "",
      default: 0.8,
    },
    detection_efficiency: {
      min: 0.1,
      max: 1.0,
      step: 0.05,
      unit: "",
      default: 0.9,
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Quantico - Simulador QKD
          </h1>
          <p className="text-gray-600 mt-2">
            Distribuição Quântica de Chaves - BB84 vs MDI-QKD
          </p>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("bb84")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === "bb84"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              BB84 Protocol
            </button>
            <button
              onClick={() => setActiveTab("mdi-qkd")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === "mdi-qkd"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              MDI-QKD Protocol
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {activeTab === "bb84" && (
          <ProtocolPanel
            protocol="bb84"
            title="Protocolo BB84"
            description="Bennett-Brassard 1984 - Protocolo de Distribuição Quântica de Chaves com segurança garantida por leis da mecânica quântica."
            parameters={bb84Parameters}
          />
        )}

        {activeTab === "mdi-qkd" && (
          <ProtocolPanel
            protocol="mdi-qkd"
            title="Protocolo MDI-QKD"
            description="Measurement-Device-Independent QKD - Seguro contra ataques de dispositivo através de medições de dois fótons."
            parameters={mdiQkdParameters}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-gray-600 text-sm">
            Quantico v1.0 - Simulador de Protocolos de Distribuição Quântica de Chaves
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
