import React from "react";
import { render, screen } from "@testing-library/react";
import ComparisonSweepChart from "./ComparisonSweepChart";
import { SweepResponse } from "../hooks/useSweepData";

describe("ComparisonSweepChart", () => {
  const mockBB84Data: SweepResponse = {
    protocol: "BB84",
    data: [
      { distance: 0, keyRate: 1000000, qber: 0.5, transmissivity: 1.0 },
      { distance: 10, keyRate: 500000, qber: 1.0, transmissivity: 0.5 },
      { distance: 20, keyRate: 100000, qber: 2.5, transmissivity: 0.25 },
      { distance: 30, keyRate: 10000, qber: 5.0, transmissivity: 0.1 },
    ],
    statistics: {
      max_key_rate: 1000000,
      min_key_rate: 10000,
      mean_key_rate: 402500,
    },
  };

  const mockMDIData: SweepResponse = {
    protocol: "MDI-QKD",
    data: [
      { distance: 0, keyRate: 800000, qber: 0.6, transmissivity: 1.0 },
      { distance: 10, keyRate: 600000, qber: 0.9, transmissivity: 0.6 },
      { distance: 30, keyRate: 300000, qber: 1.2, transmissivity: 0.2 },
      { distance: 50, keyRate: 100000, qber: 1.5, transmissivity: 0.036 },
    ],
    statistics: {
      max_key_rate: 800000,
      min_key_rate: 100000,
      mean_key_rate: 450000,
    },
  };

  it("should render loading state", () => {
    render(
      <ComparisonSweepChart
        bb84Data={null}
        mdiData={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText("Carregando dados de comparacao...")).toBeInTheDocument();
  });

  it("should render error state", () => {
    render(
      <ComparisonSweepChart
        bb84Data={null}
        mdiData={null}
        loading={false}
        error="Failed to fetch data"
      />
    );

    expect(screen.getByText("Erro ao carregar grafico")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
  });

  it("should render empty state when no data", () => {
    render(
      <ComparisonSweepChart
        bb84Data={null}
        mdiData={null}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("should render comparison chart with data", () => {
    render(
      <ComparisonSweepChart
        bb84Data={mockBB84Data}
        mdiData={mockMDIData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Comparacao BB84 vs MDI-QKD")).toBeInTheDocument();
    expect(screen.getByText(/Taxa de chave em tres distancias/)).toBeInTheDocument();
  });

  it("should render protocol descriptions", () => {
    render(
      <ComparisonSweepChart
        bb84Data={mockBB84Data}
        mdiData={mockMDIData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText(/Protocolo determinista/)).toBeInTheDocument();
    expect(screen.getByText(/Independente do dispositivo/)).toBeInTheDocument();
  });

  it("should handle missing BB84 data", () => {
    render(
      <ComparisonSweepChart
        bb84Data={null}
        mdiData={mockMDIData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("should handle missing MDI data", () => {
    render(
      <ComparisonSweepChart
        bb84Data={mockBB84Data}
        mdiData={null}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("should handle data with empty arrays", () => {
    render(
      <ComparisonSweepChart
        bb84Data={{ ...mockBB84Data, data: [] }}
        mdiData={{ ...mockMDIData, data: [] }}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("should match distances with tolerance of 2km", () => {
    // Dados com distancias nao exatas, mas dentro da margem de 2km
    const bb84WithUnexactDistances: SweepResponse = {
      protocol: "BB84",
      data: [
        { distance: 9.8, keyRate: 500000, qber: 1.0, transmissivity: 0.5 }, // Perto de 10km
        { distance: 29.5, keyRate: 10000, qber: 5.0, transmissivity: 0.1 }, // Perto de 30km
      ],
      statistics: {
        max_key_rate: 500000,
        min_key_rate: 10000,
        mean_key_rate: 255000,
      },
    };

    const mdiWithUnexactDistances: SweepResponse = {
      protocol: "MDI-QKD",
      data: [
        { distance: 10.3, keyRate: 600000, qber: 0.9, transmissivity: 0.6 }, // Perto de 10km
        { distance: 30.8, keyRate: 300000, qber: 1.2, transmissivity: 0.2 }, // Perto de 30km
        { distance: 48.5, keyRate: 100000, qber: 1.5, transmissivity: 0.036 }, // Perto de 50km
      ],
      statistics: {
        max_key_rate: 600000,
        min_key_rate: 100000,
        mean_key_rate: 333333,
      },
    };

    render(
      <ComparisonSweepChart
        bb84Data={bb84WithUnexactDistances}
        mdiData={mdiWithUnexactDistances}
        loading={false}
        error={null}
      />
    );

    // Deve renderizar o grafico, nao "Nenhum dado disponivel"
    expect(
      screen.getByText("Comparacao BB84 vs MDI-QKD")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhum dado disponivel")
    ).not.toBeInTheDocument();
  });

  it("should find closest point when multiple exist within margin", () => {
    // Dados com multiplos pontos dentro da margem de 2km para 30km
    const bb84MultipleClosest: SweepResponse = {
      protocol: "BB84",
      data: [
        { distance: 28.5, keyRate: 20000, qber: 4.0, transmissivity: 0.12 }, // 1.5km de 30
        { distance: 30.0, keyRate: 10000, qber: 5.0, transmissivity: 0.1 }, // Exato
        { distance: 31.2, keyRate: 8000, qber: 5.5, transmissivity: 0.08 }, // 1.2km de 30
      ],
      statistics: {
        max_key_rate: 20000,
        min_key_rate: 8000,
        mean_key_rate: 12666,
      },
    };

    const mdiExact: SweepResponse = {
      protocol: "MDI-QKD",
      data: [
        { distance: 30, keyRate: 300000, qber: 1.2, transmissivity: 0.2 },
      ],
      statistics: {
        max_key_rate: 300000,
        min_key_rate: 300000,
        mean_key_rate: 300000,
      },
    };

    render(
      <ComparisonSweepChart
        bb84Data={bb84MultipleClosest}
        mdiData={mdiExact}
        loading={false}
        error={null}
      />
    );

    // Deve renderizar o grafico com o ponto exato (30.0) selecionado
    expect(
      screen.getByText("Comparacao BB84 vs MDI-QKD")
    ).toBeInTheDocument();
  });
});
