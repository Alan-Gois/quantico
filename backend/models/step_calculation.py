from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class StepStatus(str, Enum):
    """Status de execução de um passo"""
    COMPLETED = "completed"
    ERROR = "error"


class CalculationStep(BaseModel):
    """Representa um passo individual do cálculo"""
    step: int = Field(..., ge=1, description="Numero do passo (1-indexed)")
    name: str = Field(..., description="Nome descritivo do passo")
    formula: str = Field(..., description="Formula em notacao LaTeX ou texto simples")
    variables: Dict[str, Any] = Field(default_factory=dict, description="Variaveis de entrada")
    result: float = Field(..., description="Resultado do calculo")
    unit: str = Field(..., description="Unidade da grandeza")
    status: StepStatus = Field(default=StepStatus.COMPLETED)
    description: Optional[str] = Field(None, description="Descricao adicional do passo")


class StepByStepResult(BaseModel):
    """Resultado completo com todos os passos intermediarios"""
    protocol: str = Field(..., description="Nome do protocolo (BB84 ou MDI-QKD)")
    distance_km: float = Field(..., ge=0, description="Distancia em km")
    steps: List[CalculationStep] = Field(..., description="Lista de passos executados")
    final_result: Dict[str, float] = Field(..., description="Resultado final com todas as metricas")
    execution_time_ms: float = Field(default=0, description="Tempo total de execucao em ms")

    class Config:
        json_schema_extra = {
            "example": {
                "protocol": "BB84",
                "distance_km": 10,
                "steps": [
                    {
                        "step": 1,
                        "name": "Atenuacao",
                        "formula": "A(L) = L × α",
                        "variables": {"L": 10, "α": 0.22},
                        "result": 2.2,
                        "unit": "dB",
                        "status": "completed",
                        "description": "Calculo da atenuacao do sinal em fibra optica"
                    },
                    {
                        "step": 2,
                        "name": "Transmissividade",
                        "formula": "T = 10^(-A/10)",
                        "variables": {"A": 2.2},
                        "result": 0.603659,
                        "unit": "adimensional",
                        "status": "completed"
                    }
                ],
                "final_result": {
                    "secret_key_rate_bps": 4612343,
                    "qber_percent": 2.0853,
                    "transmissivity": 0.603659
                },
                "execution_time_ms": 1.23
            }
        }


class SweepStepByStepResult(BaseModel):
    """Resultado de varredura com historico de passos para cada ponto"""
    protocol: str = Field(..., description="Nome do protocolo")
    min_distance_km: float
    max_distance_km: float
    num_points: int
    sweep_data: List[StepByStepResult] = Field(..., description="Dados step-by-step para cada distancia")
    aggregated_statistics: Dict[str, Dict[str, float]] = Field(
        ...,
        description="Estatisticas agregadas (min, max, mean) para cada metrica"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "protocol": "BB84",
                "min_distance_km": 0,
                "max_distance_km": 30,
                "num_points": 3,
                "sweep_data": [],
                "aggregated_statistics": {
                    "secret_key_rate_bps": {"min": 0, "max": 12345678, "mean": 6172839},
                    "qber_percent": {"min": 1.5, "max": 8.5, "mean": 5.0},
                    "transmissivity": {"min": 0.1, "max": 0.9, "mean": 0.5}
                }
            }
        }
