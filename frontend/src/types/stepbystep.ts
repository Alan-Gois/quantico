import { ProtocolParameters } from "./index";

export type StepStatus = "completed" | "error";

export interface CalculationStep {
  step: number;
  name: string;
  formula: string;
  variables: Record<string, unknown>;
  result: number;
  unit: string;
  status: StepStatus;
  description?: string;
}

export interface StepByStepResult {
  protocol: string;
  distance_km: number;
  steps: CalculationStep[];
  final_result: Record<string, number>;
  execution_time_ms: number;
}

export interface SweepStepByStepResult {
  protocol: string;
  min_distance_km: number;
  max_distance_km: number;
  num_points: number;
  sweep_data: StepByStepResult[];
  aggregated_statistics: Record<string, Record<string, number>>;
}

export interface StepByStepSimulationParams extends ProtocolParameters {
  distance_km: number;
  error_rate: number;
  efficiency: number;
}

export interface StepPanelConfig {
  inputCount: number;
  maxDistance: number;
  minDistance: number;
}

export const BB84_CONFIG: StepPanelConfig = {
  inputCount: 5,
  maxDistance: 100,
  minDistance: 0,
};

export const MDI_QKD_CONFIG: StepPanelConfig = {
  inputCount: 5,
  maxDistance: 100,
  minDistance: 0,
};

export interface ResultMetric {
  key: string;
  label: string;
  unit: string;
  formatter?: (value: number) => string;
}
