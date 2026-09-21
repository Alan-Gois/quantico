import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChartsPage from "./ChartsPage";
import { SweepCacheProvider } from "../contexts/SweepCacheContext";
import axios from "axios";

jest.mock("axios");
jest.mock("../config/env", () => ({ API_BASE_URL: "http://localhost:8000" }));
jest.mock("../components/SweepChart", () => {
  return function MockSweepChart() {
    return <div>Mock Sweep Chart</div>;
  };
});
jest.mock("../components/MetricsTimeline", () => {
  return function MockMetricsTimeline() {
    return <div>Mock Metrics Timeline</div>;
  };
});
jest.mock("../components/ComparisonSweepChart", () => {
  return function MockComparisonSweepChart() {
    return <div>Mock Comparison Sweep Chart</div>;
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <SweepCacheProvider>
      {component}
    </SweepCacheProvider>
  );
};

describe("ChartsPage", () => {
  const mockSweepResponse = {
    protocol: "BB84",
    data: [
      { distance: 0, keyRate: 1000000, qber: 0.5, transmissivity: 1.0 },
      { distance: 10, keyRate: 500000, qber: 1.0, transmissivity: 0.5 },
    ],
    statistics: {
      max_key_rate: 1000000,
      min_key_rate: 500000,
      mean_key_rate: 750000,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render page title and navigation tabs", () => {
    renderWithProvider(<ChartsPage />);
    expect(screen.getByText("Graficos de Varredura de Distancia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BB84" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MDI-QKD" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comparacao" })).toBeInTheDocument();
  });

  it("should render BB84 tab by default", () => {
    renderWithProvider(<ChartsPage />);
    expect(screen.getByText("Parametros BB84")).toBeInTheDocument();
  });

  it("should render BB84 parameter inputs", () => {
    renderWithProvider(<ChartsPage />);
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.22")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.8")).toBeInTheDocument();
  });

  it("should navigate to MDI-QKD tab", async () => {
    renderWithProvider(<ChartsPage />);
    const mdiButton = screen.getByRole("button", { name: "MDI-QKD" });
    fireEvent.click(mdiButton);
    await waitFor(() => {
      expect(screen.getByText("Parametros MDI-QKD")).toBeInTheDocument();
    });
  });

  it("should navigate to Comparison tab", async () => {
    renderWithProvider(<ChartsPage />);
    const comparisonButton = screen.getByRole("button", { name: "Comparacao" });
    fireEvent.click(comparisonButton);
    await waitFor(() => {
      expect(screen.getByText("Gerar Comparacao")).toBeInTheDocument();
    });
  });

  it("should execute BB84 sweep when button clicked", async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockSweepResponse });
    renderWithProvider(<ChartsPage />);
    const sweepButton = screen.getByRole("button", { name: "Gerar Varredura BB84" });
    fireEvent.click(sweepButton);
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/sweep/bb84"),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it("should persist data in cache across tab changes", async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockSweepResponse });
    renderWithProvider(<ChartsPage />);

    // Execute BB84 sweep
    const sweepButton = screen.getByRole("button", { name: "Gerar Varredura BB84" });
    fireEvent.click(sweepButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });

    // Navigate to MDI-QKD tab
    const mdiButton = screen.getByRole("button", { name: "MDI-QKD" });
    fireEvent.click(mdiButton);

    await waitFor(() => {
      expect(screen.getByText("Parametros MDI-QKD")).toBeInTheDocument();
    });

    // Navigate back to BB84 tab - data should still be in cache
    const bb84Button = screen.getByRole("button", { name: "BB84" });
    fireEvent.click(bb84Button);

    await waitFor(() => {
      expect(screen.getByText("Parametros BB84")).toBeInTheDocument();
    });

    // API should not have been called again
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });

  it("should show cache status indicator when data is cached", async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockSweepResponse });
    renderWithProvider(<ChartsPage />);

    const sweepButton = screen.getByRole("button", { name: "Gerar Varredura BB84" });
    fireEvent.click(sweepButton);

    await waitFor(() => {
      expect(screen.getByText(/Dados do cache/)).toBeInTheDocument();
    });
  });

  it("should allow recalculation with forceRefresh", async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockSweepResponse });
    renderWithProvider(<ChartsPage />);

    // First sweep
    const sweepButton = screen.getByRole("button", { name: "Gerar Varredura BB84" });
    fireEvent.click(sweepButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });

    // Recalculate button should appear
    const recalculateButton = screen.getByRole("button", { name: "Recalcular" });
    expect(recalculateButton).toBeInTheDocument();

    // Click recalculate
    mockAxios.post.mockResolvedValueOnce({ data: mockSweepResponse });
    fireEvent.click(recalculateButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  it("should update parameters when input changes", () => {
    renderWithProvider(<ChartsPage />);
    const maxDistanceInput = screen.getAllByDisplayValue("30")[0] as HTMLInputElement;
    fireEvent.change(maxDistanceInput, { target: { value: "25" } });
    expect(maxDistanceInput.value).toBe("25");
  });

  it("should handle errors from API", async () => {
    const errorMessage = "Network error";
    mockAxios.post.mockRejectedValueOnce(new Error(errorMessage));
    renderWithProvider(<ChartsPage />);
    const sweepButton = screen.getByRole("button", { name: "Gerar Varredura BB84" });
    fireEvent.click(sweepButton);
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });
  });

  it("should render Mock Sweep Chart components", () => {
    renderWithProvider(<ChartsPage />);
    expect(screen.getAllByText("Mock Sweep Chart")).toHaveLength(1);
  });

  it("should render Mock Metrics Timeline components", () => {
    renderWithProvider(<ChartsPage />);
    expect(screen.getAllByText("Mock Metrics Timeline")).toHaveLength(1);
  });

  it("should disable button while loading", async () => {
    mockAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockSweepResponse });
          }, 100);
        })
    );

    renderWithProvider(<ChartsPage />);
    const sweepButton = screen.getByRole("button", {
      name: "Gerar Varredura BB84",
    }) as HTMLButtonElement;

    fireEvent.click(sweepButton);
    expect(sweepButton).toBeDisabled();

    await waitFor(() => {
      expect(sweepButton).not.toBeDisabled();
    });
  });
});
