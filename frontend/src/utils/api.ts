import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:8000";

export const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as Record<string, unknown>;
      if (typeof data.detail === "string") {
        return data.detail;
      }
      return `Erro ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      return "Sem resposta do servidor. Verifique se a API está rodando.";
    } else {
      return error.message || "Erro ao fazer a requisição";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
};

export const validateProtocolParameters = (
  params: Record<string, number>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (params.distance_km !== undefined) {
    if (params.distance_km < 0 || params.distance_km > 200) {
      errors.push("Distance must be between 0 and 200 km");
    }
  }

  if (params.error_rate !== undefined) {
    if (params.error_rate < 0 || params.error_rate > 0.3) {
      errors.push("Error rate must be between 0 and 0.3");
    }
  }

  if (params.efficiency !== undefined) {
    if (params.efficiency <= 0 || params.efficiency > 1) {
      errors.push("Efficiency must be between 0 and 1");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
