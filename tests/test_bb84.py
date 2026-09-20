import pytest
from backend.calculations.quantum_protocols import BB84Calculator
from backend.models import BB84Parameters


class TestBB84Calculator:
    """Testes para BB84Calculator"""

    def test_attenuation_calculation(self):
        """Testa cálculo de atenuação"""
        # A(L) = L × α
        distance = 10  # km
        fiber_loss = 0.22  # dB/km
        expected = 10 * 0.22  # 2.2

        result = BB84Calculator.calculate_attenuation(distance, fiber_loss)
        assert result == pytest.approx(expected, rel=1e-6)

    def test_transmissivity_calculation(self):
        """Testa cálculo de transmissividade"""
        # T = 10^(-A/10)
        attenuation = 2.2
        expected = 10 ** (-2.2 / 10)  # ≈ 0.603

        result = BB84Calculator.calculate_transmissivity(attenuation)
        assert result == pytest.approx(expected, rel=1e-6)
        assert 0 <= result <= 1  # Deve estar entre 0 e 1

    def test_qubit_loss_calculation(self):
        """Testa cálculo de perda de qubit"""
        # η = 1 - T × D
        transmissivity = 0.603
        detector_eff = 0.8
        expected = 1 - (transmissivity * detector_eff)

        result = BB84Calculator.calculate_qubit_loss(transmissivity, detector_eff)
        assert result == pytest.approx(expected, rel=1e-6)
        assert 0 <= result <= 1

    def test_mean_photon_number(self):
        """Testa cálculo de número médio de fótons"""
        # μ = T × D / (1 - T × D)
        transmissivity = 0.603
        detector_eff = 0.8
        t_d = transmissivity * detector_eff
        expected = t_d / (1 - t_d)

        result = BB84Calculator.calculate_mean_photon_number(transmissivity, detector_eff)
        assert result == pytest.approx(expected, rel=1e-6)
        assert result >= 0

    def test_qber_valid_range(self):
        """Testa que QBER fica entre 0 e 100%"""
        mean_photon_values = [0.1, 1.0, 2.0, 5.0, 10.0]
        dark_count = 1e-5

        for mean_photon in mean_photon_values:
            qber = BB84Calculator.calculate_qber(mean_photon, dark_count)
            assert 0 <= qber <= 100

    def test_secret_key_rate_increases_with_transmissivity(self):
        """Testa que taxa de chave aumenta com transmissividade"""
        detector_eff = 0.8
        qber = 5.0

        rate_low = BB84Calculator.calculate_secret_key_rate(0.3, detector_eff, qber)
        rate_high = BB84Calculator.calculate_secret_key_rate(0.8, detector_eff, qber)

        assert rate_high > rate_low

    def test_secret_key_rate_zero_above_qber_limit(self):
        """Testa que taxa é zero para QBER > 11%"""
        result = BB84Calculator.calculate_secret_key_rate(0.6, 0.8, 15.0)
        assert result == 0

    def test_full_simulation(self):
        """Testa simulação completa"""
        params = BB84Parameters(
            distance_km=10,
            fiber_loss_db_km=0.22,
            detector_efficiency=0.8,
            dark_count_rate=1e-5
        )

        result = BB84Calculator.run_simulation(params)

        assert result.protocol == "BB84"
        assert result.distance_km == 10
        assert result.attenuation_db > 0
        assert 0 <= result.transmissivity <= 1
        assert 0 <= result.qubit_loss <= 1
        assert result.mean_photon_number >= 0
        assert 0 <= result.qber_percent <= 100
        assert result.secret_key_rate_bps >= 0

    def test_simulation_distance_zero(self):
        """Testa simulação com distância zero (melhor caso)"""
        params = BB84Parameters(distance_km=0)
        result = BB84Calculator.run_simulation(params)

        # Com distância zero, atenuação é zero, transmissividade é máxima
        assert result.attenuation_db == 0
        assert result.transmissivity == pytest.approx(1.0)
        assert result.secret_key_rate_bps > 0

    def test_simulation_distance_max(self):
        """Testa simulação com distância máxima (pior caso)"""
        params = BB84Parameters(distance_km=30)
        result = BB84Calculator.run_simulation(params)

        # Com 30 km: A = 30 × 0.22 = 6.6 dB
        assert result.attenuation_db == pytest.approx(6.6)
        # Transmissividade diminui com distância
        short_params = BB84Parameters(distance_km=0)
        short_result = BB84Calculator.run_simulation(short_params)
        assert result.transmissivity < short_result.transmissivity
