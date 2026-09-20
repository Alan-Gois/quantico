import time
import numpy as np
from typing import List, Dict, Any
from backend.models.schemas import BB84Parameters, MDIQKDParameters
from backend.models.step_calculation import (
    CalculationStep,
    StepByStepResult,
    SweepStepByStepResult,
    StepStatus
)


class BB84StepByStepCalculator:
    """Calculadora BB84 com rastreamento detalhado de passos"""

    @staticmethod
    def run_simulation_with_steps(params: BB84Parameters) -> StepByStepResult:
        """Executa simulacao BB84 rastreando cada passo do calculo"""
        start_time = time.perf_counter()
        steps: List[CalculationStep] = []

        try:
            step_num = 1

            # Passo 1: Atenuacao
            attenuation = params.distance_km * params.fiber_loss_db_km
            steps.append(CalculationStep(
                step=step_num,
                name="Atenuacao",
                formula="A(L) = L × α",
                variables={
                    "L (distancia)": params.distance_km,
                    "α (perda fibra)": params.fiber_loss_db_km
                },
                result=round(attenuation, 4),
                unit="dB",
                status=StepStatus.COMPLETED,
                description="Calculo da atenuacao em fibra optica: A = distancia × perda_por_km"
            ))
            step_num += 1

            # Passo 2: Transmissividade
            transmissivity = 10 ** (-attenuation / 10)
            steps.append(CalculationStep(
                step=step_num,
                name="Transmissividade",
                formula="T = 10^(-A/10)",
                variables={"A (atenuacao)": round(attenuation, 4)},
                result=round(transmissivity, 6),
                unit="adimensional",
                status=StepStatus.COMPLETED,
                description="Fracao de fótons transmitidos através da fibra optica"
            ))
            step_num += 1

            # Passo 3: Eficiencia Combinada (Transmissividade × Eficiencia do Detector)
            combined_efficiency = transmissivity * params.detector_efficiency
            steps.append(CalculationStep(
                step=step_num,
                name="Eficiencia Combinada",
                formula="η_combined = T × D",
                variables={
                    "T (transmissividade)": round(transmissivity, 6),
                    "D (eficiencia detector)": params.detector_efficiency
                },
                result=round(combined_efficiency, 6),
                unit="adimensional",
                status=StepStatus.COMPLETED,
                description="Produto da transmissividade com eficiencia do detector"
            ))
            step_num += 1

            # Passo 4: Perda de Qubit
            qubit_loss = 1 - combined_efficiency
            steps.append(CalculationStep(
                step=step_num,
                name="Perda de Qubit",
                formula="η_loss = 1 - η_combined",
                variables={"η_combined": round(combined_efficiency, 6)},
                result=round(qubit_loss, 6),
                unit="adimensional",
                status=StepStatus.COMPLETED,
                description="Fracao de qubits perdidos no canal"
            ))
            step_num += 1

            # Passo 5: Numero Medio de Fotons
            if combined_efficiency >= 1:
                mean_photon = float('inf')
            else:
                mean_photon = combined_efficiency / (1 - combined_efficiency)
            steps.append(CalculationStep(
                step=step_num,
                name="Numero Medio de Fotons",
                formula="μ = η_combined / (1 - η_combined)",
                variables={"η_combined": round(combined_efficiency, 6)},
                result=round(mean_photon if mean_photon != float('inf') else -1, 6),
                unit="fotons",
                status=StepStatus.COMPLETED,
                description="Numero medio de fotons necessarios para compensar perdas"
            ))
            step_num += 1

            # Passo 6: QBER (Quantum Bit Error Rate)
            if mean_photon <= 0 or mean_photon == float('inf'):
                qber = 100.0
            else:
                qber = (params.dark_count_rate + mean_photon * 0.005) / (mean_photon * 0.5)
                qber = min(max(qber * 100, 0), 100)
            steps.append(CalculationStep(
                step=step_num,
                name="QBER",
                formula="QBER = (d + μ × 0.005) / (μ × 0.5) × 100",
                variables={
                    "d (dark count)": params.dark_count_rate,
                    "μ (fotons)": round(mean_photon if mean_photon != float('inf') else 0, 6)
                },
                result=round(qber, 2),
                unit="percentual",
                status=StepStatus.COMPLETED,
                description="Taxa de erro de bits quanticos: medida de qualidade do canal"
            ))
            step_num += 1

            # Passo 7: Taxa de Chave Secreta
            pulse_rate = 50e6
            if qber > 11 or qber < 0:
                key_rate = 0
            else:
                key_rate = combined_efficiency * pulse_rate * (1 - 2 * 0.01 * qber)
                key_rate = max(0, key_rate)
            steps.append(CalculationStep(
                step=step_num,
                name="Taxa de Chave Secreta",
                formula="R = η_combined × f_pulse × (1 - 2 × 0.01 × QBER)",
                variables={
                    "η_combined": round(combined_efficiency, 6),
                    "f_pulse": f"{pulse_rate:.2e}",
                    "QBER": round(qber, 2)
                },
                result=round(key_rate, 0),
                unit="bps",
                status=StepStatus.COMPLETED,
                description="Taxa de bits de chave secreta por segundo (bps)"
            ))

            execution_time = (time.perf_counter() - start_time) * 1000

            return StepByStepResult(
                protocol="BB84",
                distance_km=params.distance_km,
                steps=steps,
                final_result={
                    "secret_key_rate_bps": round(key_rate, 0),
                    "qber_percent": round(qber, 2),
                    "transmissivity": round(transmissivity, 6),
                    "qubit_loss": round(qubit_loss, 6),
                    "mean_photon_number": round(mean_photon if mean_photon != float('inf') else 0, 6),
                    "attenuation_db": round(attenuation, 4)
                },
                execution_time_ms=round(execution_time, 2)
            )

        except Exception as e:
            steps.append(CalculationStep(
                step=len(steps) + 1,
                name="Erro",
                formula="N/A",
                variables={},
                result=0,
                unit="N/A",
                status=StepStatus.ERROR,
                description=f"Erro durante calculo: {str(e)}"
            ))
            execution_time = (time.perf_counter() - start_time) * 1000
            return StepByStepResult(
                protocol="BB84",
                distance_km=params.distance_km,
                steps=steps,
                final_result={},
                execution_time_ms=round(execution_time, 2)
            )


class MDIQKDStepByStepCalculator:
    """Calculadora MDI-QKD com rastreamento detalhado de passos"""

    @staticmethod
    def run_simulation_with_steps(params: MDIQKDParameters) -> StepByStepResult:
        """Executa simulacao MDI-QKD rastreando cada passo do calculo"""
        start_time = time.perf_counter()
        steps: List[CalculationStep] = []

        try:
            step_num = 1

            # Passo 1: Atenuacao
            attenuation = params.distance_km * params.fiber_loss_db_km
            steps.append(CalculationStep(
                step=step_num,
                name="Atenuacao",
                formula="A(L) = L × α",
                variables={
                    "L (distancia)": params.distance_km,
                    "α (perda fibra)": params.fiber_loss_db_km
                },
                result=round(attenuation, 4),
                unit="dB",
                status=StepStatus.COMPLETED,
                description="Calculo da atenuacao em fibra optica para protocolo MDI-QKD"
            ))
            step_num += 1

            # Passo 2: Transmissividade
            transmissivity = 10 ** (-attenuation / 10)
            steps.append(CalculationStep(
                step=step_num,
                name="Transmissividade",
                formula="η = 10^(-A/10)",
                variables={"A (atenuacao)": round(attenuation, 4)},
                result=round(transmissivity, 6),
                unit="adimensional",
                status=StepStatus.COMPLETED,
                description="Fracao de fótons transmitidos (independente de detector em MDI)"
            ))
            step_num += 1

            # Passo 3: Taxa de Deteccao
            detection_rate = transmissivity * params.detection_efficiency
            steps.append(CalculationStep(
                step=step_num,
                name="Taxa de Deteccao Normalizada",
                formula="R_det = η × D",
                variables={
                    "η (transmissividade)": round(transmissivity, 6),
                    "D (eficiencia deteccao)": params.detection_efficiency
                },
                result=round(detection_rate, 6),
                unit="adimensional",
                status=StepStatus.COMPLETED,
                description="Taxa efetiva de deteccao no ponto intermediario"
            ))
            step_num += 1

            # Passo 4: Fator QBER
            qber = params.quantum_bit_error_rate
            steps.append(CalculationStep(
                step=step_num,
                name="QBER (Entrada)",
                formula="QBER = parametro_entrada",
                variables={"QBER entrada": params.quantum_bit_error_rate},
                result=round(qber * 100, 2),
                unit="percentual",
                status=StepStatus.COMPLETED,
                description="Taxa de erro de bits quanticos fornecida como parametro"
            ))
            step_num += 1

            # Passo 5: Fator de Seguranca (MDI-specific)
            f_qber = max(0, 1 - 2 * qber)
            steps.append(CalculationStep(
                step=step_num,
                name="Fator de Seguranca",
                formula="f(QBER) = max(0, 1 - 2 × QBER)",
                variables={"QBER": round(qber, 4)},
                result=round(f_qber, 6),
                unit="adimensional",
                status=StepStatus.COMPLETED,
                description="Fator de correcao de seguranca para MDI-QKD baseado em QBER"
            ))
            step_num += 1

            # Passo 6: Taxa de Pulso
            pulse_rate = 1e6
            steps.append(CalculationStep(
                step=step_num,
                name="Taxa de Pulso",
                formula="f_pulse = 1 MHz (constante)",
                variables={"f_pulse": f"{pulse_rate:.2e}"},
                result=pulse_rate,
                unit="Hz",
                status=StepStatus.COMPLETED,
                description="Frequencia de envio de pulsos quanticos"
            ))
            step_num += 1

            # Passo 7: Taxa de Chave Secreta MDI-QKD
            if qber > 0.2 or qber < 0.05:
                key_rate = 0
            else:
                key_rate = detection_rate * pulse_rate * f_qber * 0.5
                key_rate = max(0, key_rate)

            steps.append(CalculationStep(
                step=step_num,
                name="Taxa de Chave Secreta MDI-QKD",
                formula="R = R_det × f_pulse × f(QBER) × 0.5",
                variables={
                    "R_det": round(detection_rate, 6),
                    "f_pulse": f"{pulse_rate:.2e}",
                    "f(QBER)": round(f_qber, 6)
                },
                result=round(key_rate, 0),
                unit="bps",
                status=StepStatus.COMPLETED,
                description="Taxa de bits de chave secreta para MDI-QKD (0.5 fator)"
            ))

            execution_time = (time.perf_counter() - start_time) * 1000

            return StepByStepResult(
                protocol="MDI-QKD",
                distance_km=params.distance_km,
                steps=steps,
                final_result={
                    "secret_key_rate_bps": round(key_rate, 0),
                    "qber_percent": round(qber * 100, 2),
                    "transmissivity": round(transmissivity, 6),
                    "detection_rate": round(detection_rate, 6),
                    "attenuation_db": round(attenuation, 4),
                    "security_factor": round(f_qber, 6)
                },
                execution_time_ms=round(execution_time, 2)
            )

        except Exception as e:
            steps.append(CalculationStep(
                step=len(steps) + 1,
                name="Erro",
                formula="N/A",
                variables={},
                result=0,
                unit="N/A",
                status=StepStatus.ERROR,
                description=f"Erro durante calculo: {str(e)}"
            ))
            execution_time = (time.perf_counter() - start_time) * 1000
            return StepByStepResult(
                protocol="MDI-QKD",
                distance_km=params.distance_km,
                steps=steps,
                final_result={},
                execution_time_ms=round(execution_time, 2)
            )


class SweepStepByStepCalculator:
    """Calculadora de varredura com rastreamento de passos para cada ponto"""

    @staticmethod
    def sweep_bb84_with_steps(
        min_km: float,
        max_km: float,
        num_points: int = 30,
        fiber_loss_db_km: float = 0.22,
        detector_efficiency: float = 0.8,
        dark_count_rate: float = 1e-5
    ) -> SweepStepByStepResult:
        """Varredura BB84 com rastreamento de passos para cada distancia"""
        distances = np.linspace(min_km, max_km, num_points)
        sweep_data: List[StepByStepResult] = []

        for dist in distances:
            params = BB84Parameters(
                distance_km=dist,
                fiber_loss_db_km=fiber_loss_db_km,
                detector_efficiency=detector_efficiency,
                dark_count_rate=dark_count_rate
            )
            result = BB84StepByStepCalculator.run_simulation_with_steps(params)
            sweep_data.append(result)

        aggregated_stats = _aggregate_statistics(sweep_data)

        return SweepStepByStepResult(
            protocol="BB84",
            min_distance_km=min_km,
            max_distance_km=max_km,
            num_points=num_points,
            sweep_data=sweep_data,
            aggregated_statistics=aggregated_stats
        )

    @staticmethod
    def sweep_mdi_qkd_with_steps(
        min_km: float,
        max_km: float,
        num_points: int = 30,
        fiber_loss_db_km: float = 0.22,
        detection_efficiency: float = 0.8,
        quantum_bit_error_rate: float = 0.1
    ) -> SweepStepByStepResult:
        """Varredura MDI-QKD com rastreamento de passos para cada distancia"""
        distances = np.linspace(min_km, max_km, num_points)
        sweep_data: List[StepByStepResult] = []

        for dist in distances:
            params = MDIQKDParameters(
                distance_km=dist,
                fiber_loss_db_km=fiber_loss_db_km,
                detection_efficiency=detection_efficiency,
                quantum_bit_error_rate=quantum_bit_error_rate
            )
            result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)
            sweep_data.append(result)

        aggregated_stats = _aggregate_statistics(sweep_data)

        return SweepStepByStepResult(
            protocol="MDI-QKD",
            min_distance_km=min_km,
            max_distance_km=max_km,
            num_points=num_points,
            sweep_data=sweep_data,
            aggregated_statistics=aggregated_stats
        )


def _aggregate_statistics(results: List[StepByStepResult]) -> Dict[str, Dict[str, float]]:
    """Calcula estatisticas agregadas (min, max, media) de uma lista de resultados"""
    if not results or not results[0].final_result:
        return {}

    metrics = {}
    final_results = [r.final_result for r in results if r.final_result]

    if not final_results:
        return {}

    for metric_name in final_results[0].keys():
        values = [r.get(metric_name, 0) for r in final_results if metric_name in r]
        if values:
            metrics[metric_name] = {
                "min": round(min(values), 6),
                "max": round(max(values), 6),
                "mean": round(sum(values) / len(values), 6)
            }

    return metrics
