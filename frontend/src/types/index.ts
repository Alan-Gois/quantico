export interface ProtocolParameters {
  distance_km: number;
  error_rate: number;
  efficiency: number;
  [key: string]: number;
}

export interface SimulationResult {
  distance_km: number;
  sift_rate: number;
  qber: number;
  key_rate: number;
  secure: boolean;
}

export interface SweepResult {
  distances: number[];
  sift_rates: number[];
  qbers: number[];
  key_rates: number[];
  secure_ranges: boolean[];
}

export interface BB84Parameters extends ProtocolParameters {
  basis_choice_error: number;
  detector_efficiency: number;
}

export interface MDIQKDParameters extends ProtocolParameters {
  twin_photon_rate: number;
  detection_efficiency: number;
}

export interface DashboardMetrics {
  avgKeyRate: number;
  maxDistance: number;
  currentQBER: number;
  securityStatus: "Secure" | "Insecure" | "Unknown";
}
