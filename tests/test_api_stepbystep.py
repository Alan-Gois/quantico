import pytest
from fastapi.testclient import TestClient
from backend.api.main import app


client = TestClient(app)


class TestBB84StepByStepEndpoint:
    """Testes para endpoint /simulate/bb84/stepbystep"""

    def test_endpoint_exists(self):
        """Testa se endpoint esta acessivel"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={
                "distance_km": 10,
                "fiber_loss_db_km": 0.22,
                "detector_efficiency": 0.8,
                "dark_count_rate": 1e-5
            }
        )
        assert response.status_code == 200

    def test_endpoint_returns_step_by_step_result(self):
        """Testa se endpoint retorna estrutura correta"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={
                "distance_km": 10,
                "fiber_loss_db_km": 0.22,
                "detector_efficiency": 0.8,
                "dark_count_rate": 1e-5
            }
        )
        assert response.status_code == 200
        data = response.json()

        assert "protocol" in data
        assert data["protocol"] == "BB84"
        assert "distance_km" in data
        assert "steps" in data
        assert "final_result" in data
        assert "execution_time_ms" in data

    def test_endpoint_steps_have_correct_structure(self):
        """Testa se cada passo tem estrutura correta"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 5}
        )
        assert response.status_code == 200
        data = response.json()

        for step in data["steps"]:
            assert "step" in step
            assert "name" in step
            assert "formula" in step
            assert "variables" in step
            assert "result" in step
            assert "unit" in step
            assert "status" in step

    def test_endpoint_final_result_has_metrics(self):
        """Testa se final_result tem todas as metricas esperadas"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 12}
        )
        assert response.status_code == 200
        data = response.json()
        final = data["final_result"]

        required_fields = [
            "secret_key_rate_bps",
            "qber_percent",
            "transmissivity",
            "qubit_loss",
            "attenuation_db"
        ]

        for field in required_fields:
            assert field in final

    def test_endpoint_with_custom_parameters(self):
        """Testa endpoint com parametros customizados"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={
                "distance_km": 20,
                "fiber_loss_db_km": 0.25,
                "detector_efficiency": 0.9,
                "dark_count_rate": 5e-6
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["distance_km"] == 20
        assert len(data["steps"]) > 0

    def test_endpoint_distance_zero(self):
        """Testa endpoint com distancia zero"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 0}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["steps"][0]["result"] == 0  # Atenuacao zero

    def test_endpoint_distance_max(self):
        """Testa endpoint com distancia maxima"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 30}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["steps"]) > 0
        assert data["distance_km"] == 30

    def test_endpoint_invalid_distance_negative(self):
        """Testa rejeicao de distancia negativa"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": -5}
        )
        # Pydantic valida e retorna 422
        assert response.status_code == 422

    def test_endpoint_invalid_distance_too_large(self):
        """Testa rejeicao de distancia acima do limite"""
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 50}
        )
        # Pydantic valida campo distance_km com le=30
        assert response.status_code == 422


class TestMDIQKDStepByStepEndpoint:
    """Testes para endpoint /simulate/mdi-qkd/stepbystep"""

    def test_endpoint_exists(self):
        """Testa se endpoint esta acessivel"""
        response = client.post(
            "/simulate/mdi-qkd/stepbystep",
            json={
                "distance_km": 20,
                "fiber_loss_db_km": 0.22,
                "detection_efficiency": 0.8,
                "quantum_bit_error_rate": 0.1
            }
        )
        assert response.status_code == 200

    def test_endpoint_returns_step_by_step_result(self):
        """Testa se endpoint retorna estrutura correta"""
        response = client.post(
            "/simulate/mdi-qkd/stepbystep",
            json={
                "distance_km": 30,
                "fiber_loss_db_km": 0.22,
                "detection_efficiency": 0.8,
                "quantum_bit_error_rate": 0.1
            }
        )
        assert response.status_code == 200
        data = response.json()

        assert data["protocol"] == "MDI-QKD"
        assert data["distance_km"] == 30
        assert len(data["steps"]) > 0
        assert "final_result" in data

    def test_endpoint_mdi_qkd_specific_steps(self):
        """Testa se passos especificos de MDI-QKD estao presentes"""
        response = client.post(
            "/simulate/mdi-qkd/stepbystep",
            json={
                "distance_km": 25,
                "quantum_bit_error_rate": 0.1
            }
        )
        assert response.status_code == 200
        data = response.json()

        step_names = [step["name"] for step in data["steps"]]
        assert "Taxa de Chave Secreta MDI-QKD" in step_names or "Taxa de Chave Secreta" in step_names

    def test_endpoint_with_custom_qber(self):
        """Testa endpoint com QBER customizado"""
        response = client.post(
            "/simulate/mdi-qkd/stepbystep",
            json={
                "distance_km": 40,
                "quantum_bit_error_rate": 0.08
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["steps"]) > 0

    def test_endpoint_invalid_qber_too_low(self):
        """Testa rejeicao de QBER abaixo do limite"""
        response = client.post(
            "/simulate/mdi-qkd/stepbystep",
            json={
                "distance_km": 20,
                "quantum_bit_error_rate": 0.01
            }
        )
        # Pydantic valida com ge=0.05
        assert response.status_code == 422

    def test_endpoint_invalid_qber_too_high(self):
        """Testa rejeicao de QBER acima do limite"""
        response = client.post(
            "/simulate/mdi-qkd/stepbystep",
            json={
                "distance_km": 20,
                "quantum_bit_error_rate": 0.25
            }
        )
        # Pydantic valida com le=0.2
        assert response.status_code == 422


class TestBB84SweepStepByStepEndpoint:
    """Testes para endpoint /sweep/bb84/stepbystep"""

    def test_endpoint_exists(self):
        """Testa se endpoint esta acessivel"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 15,
                "num_points": 5
            }
        )
        assert response.status_code == 200

    def test_endpoint_returns_sweep_result(self):
        """Testa se endpoint retorna estrutura de varredura"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 20,
                "num_points": 4
            }
        )
        assert response.status_code == 200
        data = response.json()

        assert data["protocol"] == "BB84"
        assert "min_distance_km" in data
        assert "max_distance_km" in data
        assert "num_points" in data
        assert "sweep_data" in data
        assert "aggregated_statistics" in data

    def test_endpoint_sweep_data_count(self):
        """Testa se numero de pontos na varredura eh correto"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 30,
                "num_points": 6
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["sweep_data"]) == 6

    def test_endpoint_sweep_data_each_has_steps(self):
        """Testa se cada ponto da varredura tem passos"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 15,
                "num_points": 3
            }
        )
        assert response.status_code == 200
        data = response.json()

        for result in data["sweep_data"]:
            assert len(result["steps"]) > 0
            assert "final_result" in result

    def test_endpoint_aggregated_statistics(self):
        """Testa se estatisticas agregadas sao calculadas"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 10,
                "num_points": 3
            }
        )
        assert response.status_code == 200
        data = response.json()

        agg = data["aggregated_statistics"]
        assert len(agg) > 0

        # Verifica min, max, mean para primeira metrica
        first_metric = list(agg.values())[0]
        assert "min" in first_metric
        assert "max" in first_metric
        assert "mean" in first_metric

    def test_endpoint_custom_fiber_loss(self):
        """Testa varredura com perda de fibra customizada"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 10,
                "num_points": 3,
                "fiber_loss_db_km": 0.3
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["sweep_data"]) == 3

    def test_endpoint_invalid_min_max(self):
        """Testa rejeicao de parametros invalidos"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 20,
                "max_km": 10,
                "num_points": 5
            }
        )
        assert response.status_code == 400

    def test_endpoint_invalid_num_points(self):
        """Testa rejeicao de numero invalido de pontos"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 10,
                "num_points": 1
            }
        )
        assert response.status_code == 400

    def test_endpoint_num_points_capped_at_100(self):
        """Testa se num_points eh limitado a 100"""
        response = client.post(
            "/sweep/bb84/stepbystep",
            params={
                "min_km": 0,
                "max_km": 30,
                "num_points": 500
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Deve estar limitado a 100
        assert len(data["sweep_data"]) <= 100


class TestMDIQKDSweepStepByStepEndpoint:
    """Testes para endpoint /sweep/mdi-qkd/stepbystep"""

    def test_endpoint_exists(self):
        """Testa se endpoint esta acessivel"""
        response = client.post(
            "/sweep/mdi-qkd/stepbystep",
            params={
                "min_km": 0,
                "max_km": 50,
                "num_points": 5
            }
        )
        assert response.status_code == 200

    def test_endpoint_returns_sweep_result(self):
        """Testa se endpoint retorna estrutura de varredura"""
        response = client.post(
            "/sweep/mdi-qkd/stepbystep",
            params={
                "min_km": 0,
                "max_km": 60,
                "num_points": 4
            }
        )
        assert response.status_code == 200
        data = response.json()

        assert data["protocol"] == "MDI-QKD"
        assert len(data["sweep_data"]) == 4

    def test_endpoint_mdi_qkd_has_detection_rate(self):
        """Testa se MDI-QKD sweep inclui taxa de deteccao"""
        response = client.post(
            "/sweep/mdi-qkd/stepbystep",
            params={
                "min_km": 0,
                "max_km": 50,
                "num_points": 2
            }
        )
        assert response.status_code == 200
        data = response.json()

        # Verifica se algum passo menciona taxa de deteccao
        for result in data["sweep_data"]:
            step_names = [step["name"] for step in result["steps"]]
            assert "Taxa de Deteccao Normalizada" in step_names

    def test_endpoint_with_custom_qber(self):
        """Testa varredura com QBER customizado"""
        response = client.post(
            "/sweep/mdi-qkd/stepbystep",
            params={
                "min_km": 0,
                "max_km": 40,
                "num_points": 3,
                "quantum_bit_error_rate": 0.12
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["sweep_data"]) == 3

    def test_endpoint_invalid_qber(self):
        """Testa rejeicao de QBER invalido na varredura"""
        response = client.post(
            "/sweep/mdi-qkd/stepbystep",
            params={
                "min_km": 0,
                "max_km": 50,
                "num_points": 5,
                "quantum_bit_error_rate": 0.25
            }
        )
        assert response.status_code == 400

    def test_endpoint_default_parameters(self):
        """Testa endpoint com parametros padrao"""
        response = client.post(
            "/sweep/mdi-qkd/stepbystep",
            params={}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["protocol"] == "MDI-QKD"


class TestStepByStepIntegrationAPI:
    """Testes de integracao entre endpoints"""

    def test_single_point_vs_sweep(self):
        """Compara resultado de ponto unico vs varredura com 1 ponto"""
        # Single point
        response_single = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 15}
        )
        data_single = response_single.json()

        # Sweep with 1 point
        response_sweep = client.post(
            "/sweep/bb84/stepbystep",
            params={"min_km": 15, "max_km": 15, "num_points": 1}
        )
        data_sweep = response_sweep.json()

        # Os valores finais devem ser semelhantes
        single_final = data_single["final_result"]
        sweep_final = data_sweep["sweep_data"][0]["final_result"]

        assert single_final["secret_key_rate_bps"] == pytest.approx(
            sweep_final["secret_key_rate_bps"], rel=0.01
        )

    def test_api_response_time(self):
        """Testa que API responde rapidamente"""
        import time

        start = time.time()
        response = client.post(
            "/simulate/bb84/stepbystep",
            json={"distance_km": 10}
        )
        elapsed = time.time() - start

        assert response.status_code == 200
        # Deve responder em menos de 1 segundo
        assert elapsed < 1.0

    def test_swagger_documentation(self):
        """Testa se endpoints estao documentados no Swagger"""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        schema = response.json()
        paths = schema["paths"]

        # Verifica se todos os novos endpoints estao na documentacao
        assert "/simulate/bb84/stepbystep" in paths
        assert "/simulate/mdi-qkd/stepbystep" in paths
        assert "/sweep/bb84/stepbystep" in paths
        assert "/sweep/mdi-qkd/stepbystep" in paths
