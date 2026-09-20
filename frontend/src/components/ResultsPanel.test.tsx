import React from "react";
import { render, screen } from "@testing-library/react";
import ResultsPanel from "./ResultsPanel";

describe("ResultsPanel", () => {
  const mockMetrics = [
    {
      key: "secret_key_rate_bps",
      label: "Taxa de Chave",
      unit: "bps",
    },
    {
      key: "qber_percent",
      label: "Taxa de Erro",
      unit: "%",
    },
    {
      key: "transmissivity",
      label: "Transmissividade",
      unit: "adim",
    },
  ];

  const mockResults = {
    secret_key_rate_bps: 4612343,
    qber_percent: 2.0853,
    transmissivity: 0.603659,
  };

  it("renders panel with title", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={mockResults}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText("Resultados")).toBeInTheDocument();
  });

  it("renders all metrics", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={mockResults}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText("Taxa de Chave")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Erro")).toBeInTheDocument();
    expect(screen.getByText("Transmissividade")).toBeInTheDocument();
  });

  it("displays formatted values", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={mockResults}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText("4.61M")).toBeInTheDocument();
    expect(screen.getByText("2.09")).toBeInTheDocument();
    expect(screen.getByText("0.6037")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={{}}
        metrics={mockMetrics}
        loading={true}
      />
    );

    const skeletonLoader = document.querySelector(".animate-pulse");
    expect(skeletonLoader).toBeInTheDocument();
  });

  it("shows error state", () => {
    const errorMessage = "Erro ao carregar resultados";
    render(
      <ResultsPanel
        title="Resultados"
        results={{}}
        metrics={mockMetrics}
        error={errorMessage}
      />
    );

    const errorTexts = screen.getAllByText("Erro ao carregar resultados");
    expect(errorTexts).toHaveLength(2);
    expect(errorTexts[0]).toBeInTheDocument();
  });

  it("displays secondary data (execution time)", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={mockResults}
        metrics={mockMetrics}
        secondaryData={{
          label: "Tempo de Execucao",
          value: 1.23,
          unit: "ms",
        }}
      />
    );

    expect(screen.getByText(/Tempo de Execucao/)).toBeInTheDocument();
    expect(screen.getByText("1.23")).toBeInTheDocument();
    expect(screen.getByText("ms")).toBeInTheDocument();
  });

  it("applies correct status colors for high key rate", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={{ secret_key_rate_bps: 5000000 }}
        metrics={[
          {
            key: "secret_key_rate_bps",
            label: "Taxa de Chave",
            unit: "bps",
          },
        ]}
      />
    );

    const successCard = screen.getByText("Taxa de Chave").closest("div[class*='bg-']");
    expect(successCard).toHaveClass("bg-green-50");
  });

  it("applies correct status colors for high QBER", () => {
    render(
      <ResultsPanel
        title="Resultados"
        results={{ qber_percent: 5.0 }}
        metrics={[
          {
            key: "qber_percent",
            label: "Taxa de Erro",
            unit: "%",
          },
        ]}
      />
    );

    const errorCard = screen.getByText("Taxa de Erro").closest("div[class*='bg-']");
    expect(errorCard).toHaveClass("bg-red-50");
  });

  it("uses custom formatter when provided", () => {
    const customMetrics = [
      {
        key: "custom_metric",
        label: "Custom Metric",
        unit: "custom",
        formatter: (value: number) => `CUSTOM_${value}`,
      },
    ];

    render(
      <ResultsPanel
        title="Resultados"
        results={{ custom_metric: 100 }}
        metrics={customMetrics}
      />
    );

    expect(screen.getByText("CUSTOM_100")).toBeInTheDocument();
  });

  it("skips metrics not in results", () => {
    const results = {
      secret_key_rate_bps: 1000,
    };

    render(
      <ResultsPanel
        title="Resultados"
        results={results}
        metrics={mockMetrics}
      />
    );

    // Only first metric should be rendered
    expect(screen.getByText("Taxa de Chave")).toBeInTheDocument();
    expect(screen.queryByText("Taxa de Erro")).not.toBeInTheDocument();
  });
});
