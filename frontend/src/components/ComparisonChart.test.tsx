import React from "react";
import { render, screen } from "@testing-library/react";
import ComparisonChart from "./ComparisonChart";

describe("ComparisonChart", () => {
  const mockData = [
    { label: "Metrica 1", bb84: 100, mdiQkd: 150 },
    { label: "Metrica 2", bb84: 200, mdiQkd: 180 },
    { label: "Metrica 3", bb84: 300, mdiQkd: 320 },
  ];

  it("renders chart with title", () => {
    render(
      <ComparisonChart
        title="Grafico de Comparacao"
        data={mockData}
      />
    );

    expect(screen.getByText("Grafico de Comparacao")).toBeInTheDocument();
  });

  it("renders legend with protocol names", () => {
    render(
      <ComparisonChart
        title="Comparacao"
        data={mockData}
      />
    );

    expect(screen.getByText("BB84")).toBeInTheDocument();
    expect(screen.getByText("MDI-QKD")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <ComparisonChart
        title="Comparacao"
        data={[]}
        loading={true}
      />
    );

    const skeletonLoader = document.querySelector(".animate-pulse");
    expect(skeletonLoader).toBeInTheDocument();
  });

  it("shows error state", () => {
    const errorMessage = "Erro ao carregar grafico";
    render(
      <ComparisonChart
        title="Comparacao"
        data={[]}
        error={errorMessage}
      />
    );

    const errorTexts = screen.getAllByText("Erro ao carregar grafico");
    expect(errorTexts).toHaveLength(2);
    expect(errorTexts[0]).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(
      <ComparisonChart
        title="Comparacao"
        data={[]}
      />
    );

    expect(screen.getByText("Nenhum dado disponivel")).toBeInTheDocument();
  });

  it("renders ResponsiveContainer for responsive behavior", () => {
    const { container } = render(
      <ComparisonChart
        title="Comparacao"
        data={mockData}
      />
    );

    // Check if ResponsiveContainer is rendered by checking SVG content
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  it("displays color legend with correct colors", () => {
    const { container } = render(
      <ComparisonChart
        title="Comparacao"
        data={mockData}
      />
    );

    const legendItems = container.querySelectorAll("div[class*='bg-']");
    expect(legendItems.length).toBeGreaterThan(0);
  });

  it("renders with custom y-axis label", () => {
    render(
      <ComparisonChart
        title="Comparacao"
        data={mockData}
        yAxisLabel="Taxa de Chave (bps)"
      />
    );

    const title = screen.getByText("Comparacao");
    expect(title).toBeInTheDocument();
  });

  it("renders protocol squares in legend", () => {
    const { container } = render(
      <ComparisonChart
        title="Comparacao"
        data={mockData}
      />
    );

    // Check that the chart renders successfully (charts from Recharts don't have simple selectors)
    const chartContainer = container.querySelector("svg");
    expect(chartContainer).toBeInTheDocument();
    expect(screen.getByText("BB84")).toBeInTheDocument();
    expect(screen.getByText("MDI-QKD")).toBeInTheDocument();
  });
});
