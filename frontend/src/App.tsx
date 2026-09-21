import React, { useState } from "react";
import StepByStepDashboard from "./pages/StepByStepDashboard";
import ChartsPage from "./pages/ChartsPage";
import { SweepCacheProvider } from "./contexts/SweepCacheContext";

type PageType = "dashboard" | "charts";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  return (
    <SweepCacheProvider>
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Quantico</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage("charts")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === "charts"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Graficos
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              v2.0.0
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage === "dashboard" && <StepByStepDashboard />}
        {currentPage === "charts" && <ChartsPage />}
      </main>
    </SweepCacheProvider>
  );
};

export default App;
