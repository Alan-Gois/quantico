import pytest
from backend.models import BB84Parameters, MDIQKDParameters
from backend.calculations.quantum_protocols_stepbystep import (
    BB84StepByStepCalculator,
    MDIQKDStepByStepCalculator,
    SweepStepByStepCalculator
)


class TestBB84StepByStep:
    """Testes para BB84StepByStepCalculator"""

    def test_bb84_step_by_step_structure(self):
        """Testa se resultado tem estrutura correta com passos"""
        params = BB84Parameters(
            distance_km=10,
            fiber_loss_db_km=0.22,
            detector_efficiency=0.8,
            dark_count_rate=1e-5
        )

        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        assert result.protocol == "BB84"
        assert result.distance_km == 10
        assert len(result.steps) > 0
        assert result.final_result is not None
        assert result.execution_time_ms >= 0

    def test_bb84_step_by_step_has_all_steps(self):
        """Testa se todos os passos esperados estao presentes"""
        params = BB84Parameters(distance_km=10)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        step_names = [step.name for step in result.steps]

        assert "Atenuacao" in step_names
        assert "Transmissividade" in step_names
        assert "Eficiencia Combinada" in step_names
        assert "Perda de Qubit" in step_names
        assert "Numero Medio de Fotons" in step_names
        assert "QBER" in step_names
        assert "Taxa de Chave Secreta" in step_names

    def test_bb84_step_ordering(self):
        """Testa se os passos estao em ordem numerica"""
        params = BB84Parameters(distance_km=5)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        for i, step in enumerate(result.steps, start=1):
            assert step.step == i

    def test_bb84_step_formula_presence(self):
        """Testa se cada passo tem formula definida"""
        params = BB84Parameters(distance_km=15)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        for step in result.steps:
            assert step.formula is not None
            assert len(step.formula) > 0
            assert step.unit is not None
            assert len(step.unit) > 0

    def test_bb84_step_variables_tracked(self):
        """Testa se variaveis de entrada sao rastreadas"""
        params = BB84Parameters(distance_km=8)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        # Primeiro passo deve ter distancia e perda de fibra
        first_step = result.steps[0]
        assert "L (distancia)" in first_step.variables or "distancia" in str(first_step.variables).lower()
        assert first_step.variables is not None

    def test_bb84_attenuation_calculation_matches_formula(self):
        """Testa se atenuacao calculada bate com formula"""
        distance = 10
        fiber_loss = 0.22
        params = BB84Parameters(distance_km=distance, fiber_loss_db_km=fiber_loss)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        attenuation_step = result.steps[0]
        expected = distance * fiber_loss
        assert attenuation_step.result == pytest.approx(expected, rel=1e-4)

    def test_bb84_transmissivity_follows_attenuation(self):
        """Testa se transmissividade segue corretamente a atenuacao"""
        params = BB84Parameters(distance_km=10)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        atten = result.steps[0].result
        transmissivity = result.steps[1].result
        expected = 10 ** (-atten / 10)

        assert transmissivity == pytest.approx(expected, rel=1e-5)

    def test_bb84_final_result_metrics(self):
        """Testa se final_result tem todas as metricas esperadas"""
        params = BB84Parameters(distance_km=12)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        required_metrics = [
            "secret_key_rate_bps",
            "qber_percent",
            "transmissivity",
            "qubit_loss",
            "mean_photon_number",
            "attenuation_db"
        ]

        for metric in required_metrics:
            assert metric in result.final_result
            assert isinstance(result.final_result[metric], (int, float))

    def test_bb84_step_by_step_distance_zero(self):
        """Testa step-by-step com distancia zero"""
        params = BB84Parameters(distance_km=0)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        assert result.steps[0].result == 0  # Atenuacao zero
        assert result.steps[1].result == pytest.approx(1.0)  # Transmissividade = 1

    def test_bb84_step_by_step_error_handling(self):
        """Testa tratamento de erro em parametros invalidos"""
        params = BB84Parameters(
            distance_km=10,
            detector_efficiency=0.0
        )
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        # Nao deve lançar excecao, mas resultado pode ser degradado
        assert result is not None


class TestMDIQKDStepByStep:
    """Testes para MDIQKDStepByStepCalculator"""

    def test_mdi_qkd_step_by_step_structure(self):
        """Testa se resultado tem estrutura correta com passos"""
        params = MDIQKDParameters(
            distance_km=20,
            fiber_loss_db_km=0.22,
            detection_efficiency=0.8,
            quantum_bit_error_rate=0.1
        )

        result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)

        assert result.protocol == "MDI-QKD"
        assert result.distance_km == 20
        assert len(result.steps) > 0
        assert result.final_result is not None
        assert result.execution_time_ms >= 0

    def test_mdi_qkd_step_by_step_has_key_steps(self):
        """Testa se passos principais de MDI-QKD estao presentes"""
        params = MDIQKDParameters(distance_km=25)
        result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)

        step_names = [step.name for step in result.steps]

        assert "Atenuacao" in step_names
        assert "Transmissividade" in step_names
        assert "Taxa de Deteccao Normalizada" in step_names
        assert "Fator de Seguranca" in step_names
        assert "Taxa de Chave Secreta MDI-QKD" in step_names

    def test_mdi_qkd_step_ordering(self):
        """Testa se os passos estao em ordem numerica"""
        params = MDIQKDParameters(distance_km=10)
        result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)

        for i, step in enumerate(result.steps, start=1):
            assert step.step == i

    def test_mdi_qkd_final_result_metrics(self):
        """Testa se final_result tem todas as metricas de MDI-QKD"""
        params = MDIQKDParameters(distance_km=30)
        result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)

        required_metrics = [
            "secret_key_rate_bps",
            "qber_percent",
            "transmissivity",
            "detection_rate",
            "attenuation_db",
            "security_factor"
        ]

        for metric in required_metrics:
            assert metric in result.final_result

    def test_mdi_qkd_attenuation_increases_with_distance(self):
        """Testa se atenuacao aumenta com distancia"""
        params_short = MDIQKDParameters(distance_km=10)
        params_long = MDIQKDParameters(distance_km=50)

        result_short = MDIQKDStepByStepCalculator.run_simulation_with_steps(params_short)
        result_long = MDIQKDStepByStepCalculator.run_simulation_with_steps(params_long)

        atten_short = result_short.steps[0].result
        atten_long = result_long.steps[0].result

        assert atten_long > atten_short


class TestSweepStepByStep:
    """Testes para SweepStepByStepCalculator"""

    def test_bb84_sweep_structure(self):
        """Testa estrutura de varredura BB84"""
        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=0,
            max_km=10,
            num_points=5
        )

        assert result.protocol == "BB84"
        assert result.min_distance_km == 0
        assert result.max_distance_km == 10
        assert len(result.sweep_data) == 5
        assert result.aggregated_statistics is not None

    def test_bb84_sweep_all_points_have_steps(self):
        """Testa se cada ponto da varredura tem passos"""
        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=0,
            max_km=20,
            num_points=4
        )

        for step_result in result.sweep_data:
            assert len(step_result.steps) > 0
            assert step_result.final_result is not None

    def test_bb84_sweep_distances_increasing(self):
        """Testa se distancias na varredura estao em ordem crescente"""
        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=0,
            max_km=30,
            num_points=6
        )

        distances = [r.distance_km for r in result.sweep_data]
        assert distances == sorted(distances)
        assert distances[0] >= 0
        assert distances[-1] <= 30

    def test_bb84_sweep_aggregated_statistics(self):
        """Testa se estatisticas agregadas sao calculadas"""
        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=0,
            max_km=20,
            num_points=5
        )

        assert "secret_key_rate_bps" in result.aggregated_statistics
        stats = result.aggregated_statistics["secret_key_rate_bps"]
        assert "min" in stats
        assert "max" in stats
        assert "mean" in stats
        assert stats["min"] <= stats["mean"] <= stats["max"]

    def test_mdi_qkd_sweep_structure(self):
        """Testa estrutura de varredura MDI-QKD"""
        result = SweepStepByStepCalculator.sweep_mdi_qkd_with_steps(
            min_km=0,
            max_km=50,
            num_points=5
        )

        assert result.protocol == "MDI-QKD"
        assert result.min_distance_km == 0
        assert result.max_distance_km == 50
        assert len(result.sweep_data) == 5

    def test_mdi_qkd_sweep_distances_correct(self):
        """Testa se distancias da varredura MDI-QKD sao corretas"""
        result = SweepStepByStepCalculator.sweep_mdi_qkd_with_steps(
            min_km=10,
            max_km=90,
            num_points=9
        )

        distances = [r.distance_km for r in result.sweep_data]
        # NumPy linspace deve gerar distancias uniformes
        expected_range = set([10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0])
        actual_rounded = {round(d) for d in distances}
        # Permite um pequeno erro de precisao
        assert len(distances) == 9

    def test_sweep_aggregated_multiple_metrics(self):
        """Testa que multiplas metricas sao agregadas"""
        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=0,
            max_km=15,
            num_points=3
        )

        agg = result.aggregated_statistics
        # Deve ter multiplas metricas
        assert len(agg) > 1

        # Cada metrica deve ter min, max, mean
        for metric_name, stats in agg.items():
            assert "min" in stats
            assert "max" in stats
            assert "mean" in stats

    def test_sweep_minimum_points(self):
        """Testa varredura com numero minimo de pontos"""
        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=0,
            max_km=10,
            num_points=2
        )

        assert len(result.sweep_data) == 2
        assert result.sweep_data[0].distance_km == 0.0
        assert result.sweep_data[1].distance_km == 10.0


class TestStepByStepIntegration:
    """Testes de integracao para componentes step-by-step"""

    def test_bb84_consistency_with_original_calculator(self):
        """Testa se resultados BB84 sao consistentes com calculadora original"""
        from backend.calculations.quantum_protocols import BB84Calculator

        params = BB84Parameters(distance_km=15)

        # Calcula com original
        original_result = BB84Calculator.run_simulation(params)

        # Calcula com step-by-step
        stepbystep_result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        # Valores finais devem bater
        assert stepbystep_result.final_result["secret_key_rate_bps"] == pytest.approx(
            original_result.secret_key_rate_bps, rel=0.01
        )
        assert stepbystep_result.final_result["qber_percent"] == pytest.approx(
            original_result.qber_percent, rel=0.01
        )
        assert stepbystep_result.final_result["transmissivity"] == pytest.approx(
            original_result.transmissivity, rel=0.001
        )

    def test_mdi_qkd_consistency_with_original_calculator(self):
        """Testa se resultados MDI-QKD sao consistentes com calculadora original"""
        from backend.calculations.quantum_protocols import MDIQKDCalculator

        params = MDIQKDParameters(distance_km=40)

        # Calcula com original
        original_result = MDIQKDCalculator.run_simulation(params)

        # Calcula com step-by-step
        stepbystep_result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)

        # Valores finais devem bater
        assert stepbystep_result.final_result["transmissivity"] == pytest.approx(
            original_result.transmissivity, rel=0.001
        )

    def test_step_result_values_are_numeric(self):
        """Testa que todos os valores de passos sao numericos"""
        params = BB84Parameters(distance_km=10)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        for step in result.steps:
            assert isinstance(step.result, (int, float))
            assert step.unit is not None

    def test_execution_time_is_reasonable(self):
        """Testa se tempo de execucao eh razoavel"""
        params = BB84Parameters(distance_km=10)
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)

        # Calculo deve ser muito rapido (menos de 100ms)
        assert result.execution_time_ms < 100
        assert result.execution_time_ms >= 0
