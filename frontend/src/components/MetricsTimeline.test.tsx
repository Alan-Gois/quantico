import React from "react";
import { render, screen } from "@testing-library/react";
import MetricsTimeline from "./MetricsTimeline";
import { SweepResponse } from "../hooks/useSweepData";

describe("MetricsTimeline", () => {
  const mockSweepData: SweepResponse = {
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

  it("should render loading state", () => {
    render(
      <MetricsTimeline
        data={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("should render error state", () => {
    render(
      <MetricsTimeline
        data={null}
        loading={false}
        error="Failed to fetch data"
      />
    );

    expect(screen.getByText("Erro ao carregar grafico")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
  });

  it("should render empty state when no data", () => {
    render(
      <MetricsTimeline
        data={null}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("should render timeline with data", () => {
    render(
      <MetricsTimeline
        data={mockSweepData}
        loading={false}
        error={null}
        title="Custom Title"
        protocol="BB84"
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText(/Escala Logaritmica/)).toBeInTheDocument();
  });

  it("should render correct protocol label for MDI-QKD", () => {
    const mdiData = { ...mockSweepData, protocol: "MDI-QKD" };

    render(
      <MetricsTimeline
        data={mdiData}
        loading={false}
        error={null}
        protocol="MDI-QKD"
      />
    );

    expect(screen.getByText("Evolucao de Taxa de Chave")).toBeInTheDocument();
  });

  it("should render info box about logarithmic scale", () => {
    render(
      <MetricsTimeline
        data={mockSweepData}
        loading={false}
        error={null}
      />
    );

    expect(
      screen.getByText(
        /O eixo Y da taxa de chave utiliza escala logaritmica/
      )
    ).toBeInTheDocument();
  });

  it("should handle data with empty array", () => {
    render(
      <MetricsTimeline
        data={{ ...mockSweepData, data: [] }}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });
});
