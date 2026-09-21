import React from "react";
import { render, screen } from "@testing-library/react";
import SweepChart from "./SweepChart";
import { SweepResponse } from "../hooks/useSweepData";

describe("SweepChart", () => {
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
      max_qber: 5.0,
      min_qber: 0.5,
    },
  };

  it("should render loading state", () => {
    render(
      <SweepChart
        data={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("should render error state", () => {
    render(
      <SweepChart
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
      <SweepChart
        data={null}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("should render chart with data", () => {
    render(
      <SweepChart
        data={mockSweepData}
        loading={false}
        error={null}
        title="Test Chart"
        protocol="BB84"
      />
    );

    expect(screen.getByText("Test Chart")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Chave Max")).toBeInTheDocument();
    expect(screen.getByText("QBER Max")).toBeInTheDocument();
    expect(screen.getByText("Taxa Media")).toBeInTheDocument();
  });

  it("should display correct statistics", () => {
    render(
      <SweepChart
        data={mockSweepData}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("1000.00 kbps")).toBeInTheDocument();
    expect(screen.getByText("5.00%")).toBeInTheDocument();
  });

  it("should render correct protocol label for MDI-QKD", () => {
    const mdiData = { ...mockSweepData, protocol: "MDI-QKD" };

    render(
      <SweepChart
        data={mdiData}
        loading={false}
        error={null}
        protocol="MDI-QKD"
      />
    );

    expect(screen.getByText(/protocolo MDI-QKD/)).toBeInTheDocument();
  });

  it("should handle data with empty array", () => {
    render(
      <SweepChart
        data={{ ...mockSweepData, data: [] }}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });
});
