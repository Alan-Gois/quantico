from pydantic import BaseModel, Field
from typing import Optional


class BB84Parameters(BaseModel):
    distance_km: float = Field(..., ge=0, le=30, description="Distance in km")
    fiber_loss_db_km: float = Field(0.22, description="Fiber loss in dB/km")
    detector_efficiency: float = Field(0.8, ge=0, le=1, description="Detector efficiency (0-1)")
    dark_count_rate: float = Field(1e-5, ge=0, description="Dark count rate per second")


class MDIQKDParameters(BaseModel):
    distance_km: float = Field(..., ge=0, le=100, description="Distance in km")
    fiber_loss_db_km: float = Field(0.22, description="Fiber loss in dB/km")
    detection_efficiency: float = Field(0.8, ge=0, le=1, description="Detection efficiency (0-1)")
    quantum_bit_error_rate: float = Field(0.1, ge=0.05, le=0.2, description="QBER")


class SimulationResult(BaseModel):
    protocol: str
    distance_km: float
    attenuation_db: float
    transmissivity: float
    qubit_loss: float
    mean_photon_number: float
    qber_percent: float
    secret_key_rate_bps: float

    class Config:
        json_schema_extra = {
            "example": {
                "protocol": "BB84",
                "distance_km": 10,
                "attenuation_db": 2.2,
                "transmissivity": 0.6,
                "qubit_loss": 0.3,
                "mean_photon_number": 2.0,
                "qber_percent": 5.26,
                "secret_key_rate_bps": 9900000
            }
        }


class DashboardData(BaseModel):
    bb84_results: list[SimulationResult]
    mdi_qkd_results: list[SimulationResult]
    key_metrics: dict
    timestamp: str
