import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import App from "./App";
jest.mock("axios");
jest.mock("./config/env", () => ({ API_BASE_URL: "http://localhost:8000" }));
jest.mock("./components/ComparisonChart", () => () => null);
const post = axios.post as jest.Mock;

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits physical parameters to both step endpoints and displays seven steps", async () => {
    post.mockResolvedValue({ data: { protocol: "BB84", distance_km: 10,
      steps: Array.from({ length: 7 }, (_, i) => ({ step: i+1, name: `Etapa ${i+1}`, formula: "x", variables: {}, result: 1, unit: "", status: "completed" })),
      final_result: { secret_key_rate_bps: 23619300, qber_percent: 1, transmissivity: 0.60256 }, execution_time_ms: 1 } });
    render(<App />);
    expect(screen.getByRole("spinbutton", { name: "Dark Count Rate" })).toHaveValue(0.00001);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Fiber Loss" }), { target: { value: "0.23" } });
    fireEvent.click(screen.getByRole("button", { name: "Simular" }));
    await screen.findByText("Passos de Calculo (7)");
    expect(post).toHaveBeenLastCalledWith("http://localhost:8000/simulate/bb84/stepbystep", { distance_km: 10, fiber_loss_db_km: 0.23, detector_efficiency: 0.8, dark_count_rate: 0.00001 }, { timeout: 10000 });
    fireEvent.click(screen.getByRole("button", { name: "Expandir Todos" }));
    expect(screen.getAllByText("Formula")).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: "MDI-QKD" }));
    expect(screen.queryByRole("spinbutton", { name: "Dark Count Rate" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Simular" }));
    await waitFor(() => expect(post).toHaveBeenLastCalledWith("http://localhost:8000/simulate/mdi-qkd/stepbystep", { distance_km: 10, fiber_loss_db_km: 0.22, detection_efficiency: 0.8, quantum_bit_error_rate: 0.1 }, { timeout: 10000 }));
  });

  it("should render navigation bar with all buttons", () => {
    render(<App />);
    expect(screen.getByText("Quantico")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Graficos" })).toBeInTheDocument();
    expect(screen.getByText("v2.0.0")).toBeInTheDocument();
  });

  it("should show dashboard by default", () => {
    render(<App />);
    expect(screen.getByText("Simulador Quantico Passo a Passo")).toBeInTheDocument();
  });

  it("should navigate to charts page when clicking Graficos button", async () => {
    render(<App />);
    const chartsButton = screen.getByRole("button", { name: "Graficos" });
    fireEvent.click(chartsButton);
    await waitFor(() => {
      expect(screen.getByText("Graficos de Varredura de Distancia")).toBeInTheDocument();
    });
  });

  it("should navigate back to dashboard when clicking Dashboard button", async () => {
    render(<App />);
    const chartsButton = screen.getByRole("button", { name: "Graficos" });
    fireEvent.click(chartsButton);
    await waitFor(() => {
      expect(screen.getByText("Graficos de Varredura de Distancia")).toBeInTheDocument();
    });

    const dashboardButton = screen.getByRole("button", { name: "Dashboard" });
    fireEvent.click(dashboardButton);
    await waitFor(() => {
      expect(screen.getByText("Simulador Quantico Passo a Passo")).toBeInTheDocument();
    });
  });
});
