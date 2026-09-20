import pandas as pd
import numpy as np
from typing import Dict, List
from backend.models.schemas import BB84Parameters, MDIQKDParameters, SimulationResult


class BB84Calculator:
    """Cálculos para protocolo BB84 (quantum key distribution)"""

    @staticmethod
    def calculate_attenuation(distance_km: float, fiber_loss_db_km: float) -> float:
        """Calcula atenuação em dB = L × α"""
        return distance_km * fiber_loss_db_km

    @staticmethod
    def calculate_transmissivity(attenuation_db: float) -> float:
        """Transmissividade: T = 10^(-atenuação_dB / 10)"""
        return 10 ** (-attenuation_db / 10)

    @staticmethod
    def calculate_qubit_loss(transmissivity: float, detector_efficiency: float) -> float:
        """Perda de qubit: η = 1 - T × D"""
        return 1 - (transmissivity * detector_efficiency)

    @staticmethod
    def calculate_mean_photon_number(transmissivity: float, detector_efficiency: float) -> float:
        """Número médio de fótons: μ = T × D / (1 - T × D)"""
        t_d = transmissivity * detector_efficiency
        if t_d >= 1:
            return float('inf')
        return t_d / (1 - t_d)

    @staticmethod
    def calculate_qber(mean_photon: float, dark_count: float) -> float:
        """QBER com média de fótons e contagem escura"""
        if mean_photon <= 0:
            return 100.0
        qber = (dark_count + mean_photon * 0.005) / (mean_photon * 0.5)
        return min(max(qber * 100, 0), 100)

    @staticmethod
    def calculate_secret_key_rate(
        transmissivity: float,
        detector_efficiency: float,
        qber_percent: float,
        pulse_rate_mhz: float = 50
    ) -> float:
        """Taxa de chave secreta em bps"""
        if qber_percent > 11 or qber_percent < 0:
            return 0

        t_d = transmissivity * detector_efficiency
        key_rate = t_d * (pulse_rate_mhz * 1e6) * (1 - 2 * 0.01 * qber_percent)
        return max(0, key_rate)

    @classmethod
    def run_simulation(cls, params: BB84Parameters) -> SimulationResult:
        """Executa simulação completa para BB84"""
        attenuation = cls.calculate_attenuation(params.distance_km, params.fiber_loss_db_km)
        transmissivity = cls.calculate_transmissivity(attenuation)
        qubit_loss = cls.calculate_qubit_loss(transmissivity, params.detector_efficiency)
        mean_photon = cls.calculate_mean_photon_number(transmissivity, params.detector_efficiency)
        qber = cls.calculate_qber(mean_photon, params.dark_count_rate)
        key_rate = cls.calculate_secret_key_rate(transmissivity, params.detector_efficiency, qber)

        return SimulationResult(
            protocol="BB84",
            distance_km=params.distance_km,
            attenuation_db=round(attenuation, 4),
            transmissivity=round(transmissivity, 6),
            qubit_loss=round(qubit_loss, 6),
            mean_photon_number=round(mean_photon, 6),
            qber_percent=round(qber, 2),
            secret_key_rate_bps=round(key_rate, 0)
        )


class MDIQKDCalculator:
    """Cálculos para protocolo MDI-QKD (measurement-device-independent)"""

    @staticmethod
    def calculate_attenuation(distance_km: float, fiber_loss_db_km: float) -> float:
        """Atenuação: A(L) = L × α"""
        return distance_km * fiber_loss_db_km

    @staticmethod
    def calculate_transmissivity(attenuation_db: float) -> float:
        """Transmissividade: η = 10^(-A/10)"""
        return 10 ** (-attenuation_db / 10)

    @staticmethod
    def calculate_detection_rate(transmissivity: float, detection_eff: float) -> float:
        """Taxa de detecção normalizada"""
        return transmissivity * detection_eff

    @staticmethod
    def calculate_secret_key_rate_mdi(
        distance_km: float,
        transmissivity: float,
        qber: float,
        detection_eff: float = 0.8,
        pulse_rate: float = 1e6
    ) -> float:
        """Taxa de chave secreta para MDI-QKD"""
        if qber > 0.2 or qber < 0.05:
            return 0

        # Modelo simplificado: R_secret = η × pulse_rate × f(QBER)
        eta = transmissivity * detection_eff
        f_qber = max(0, 1 - 2 * qber)
        rate = eta * pulse_rate * f_qber * 0.5

        return max(0, rate)

    @classmethod
    def run_simulation(cls, params: MDIQKDParameters) -> SimulationResult:
        """Executa simulação completa para MDI-QKD"""
        attenuation = cls.calculate_attenuation(params.distance_km, params.fiber_loss_db_km)
        transmissivity = cls.calculate_transmissivity(attenuation)
        det_rate = cls.calculate_detection_rate(transmissivity, params.detection_efficiency)
        key_rate = cls.calculate_secret_key_rate_mdi(
            params.distance_km,
            transmissivity,
            params.quantum_bit_error_rate,
            params.detection_efficiency
        )

        return SimulationResult(
            protocol="MDI-QKD",
            distance_km=params.distance_km,
            attenuation_db=round(attenuation, 4),
            transmissivity=round(transmissivity, 6),
            qubit_loss=round(1 - det_rate, 6),
            mean_photon_number=round(transmissivity * 2, 6),
            qber_percent=round(params.quantum_bit_error_rate * 100, 2),
            secret_key_rate_bps=round(key_rate, 0)
        )


def generate_distance_sweep(
    protocol: str,
    min_km: float,
    max_km: float,
    num_points: int = 30,
    **kwargs
) -> pd.DataFrame:
    """Gera varredura de distância para ambos os protocolos"""
    distances = np.linspace(min_km, max_km, num_points)
    results = []

    calculator = BB84Calculator if protocol == "BB84" else MDIQKDCalculator

    for dist in distances:
        if protocol == "BB84":
            params = BB84Parameters(distance_km=dist, **kwargs)
        else:
            params = MDIQKDParameters(distance_km=dist, **kwargs)

        result = calculator.run_simulation(params)
        results.append(result.model_dump())

    return pd.DataFrame(results)
