from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pandas as pd

from backend.models import (
    BB84Parameters,
    MDIQKDParameters,
    SimulationResult,
    DashboardData,
    StepByStepResult,
    SweepStepByStepResult
)
from backend.calculations.quantum_protocols import (
    BB84Calculator,
    MDIQKDCalculator,
    generate_distance_sweep
)
from backend.calculations.quantum_protocols_stepbystep import (
    BB84StepByStepCalculator,
    MDIQKDStepByStepCalculator,
    SweepStepByStepCalculator
)

app = FastAPI(
    title="Quantico API",
    description="API para simulações de protocolos quânticos BB84 e MDI-QKD",
    version="1.0.0"
)

# Habilitar CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Verifica saúde da API"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/simulate/bb84")
async def simulate_bb84(params: BB84Parameters) -> SimulationResult:
    """Simula protocolo BB84 para os parâmetros fornecidos"""
    try:
        result = BB84Calculator.run_simulation(params)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na simulação: {str(e)}")


@app.post("/simulate/mdi-qkd")
async def simulate_mdi_qkd(params: MDIQKDParameters) -> SimulationResult:
    """Simula protocolo MDI-QKD para os parâmetros fornecidos"""
    try:
        result = MDIQKDCalculator.run_simulation(params)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na simulação: {str(e)}")


@app.post("/sweep/bb84")
async def sweep_bb84(
    min_km: float = 0,
    max_km: float = 30,
    num_points: int = 30,
    fiber_loss_db_km: float = 0.22,
    detector_efficiency: float = 0.8,
    dark_count_rate: float = 1e-5
) -> dict:
    """Varredura de distância para BB84"""
    try:
        df = generate_distance_sweep(
            "BB84",
            min_km,
            max_km,
            num_points,
            fiber_loss_db_km=fiber_loss_db_km,
            detector_efficiency=detector_efficiency,
            dark_count_rate=dark_count_rate
        )
        return {
            "protocol": "BB84",
            "data": df.to_dict(orient="records"),
            "statistics": {
                "min_key_rate": float(df["secret_key_rate_bps"].min()),
                "max_key_rate": float(df["secret_key_rate_bps"].max()),
                "mean_key_rate": float(df["secret_key_rate_bps"].mean())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na varredura: {str(e)}")


@app.post("/sweep/mdi-qkd")
async def sweep_mdi_qkd(
    min_km: float = 0,
    max_km: float = 100,
    num_points: int = 30,
    fiber_loss_db_km: float = 0.22,
    detection_efficiency: float = 0.8,
    quantum_bit_error_rate: float = 0.1
) -> dict:
    """Varredura de distância para MDI-QKD"""
    try:
        df = generate_distance_sweep(
            "MDI-QKD",
            min_km,
            max_km,
            num_points,
            fiber_loss_db_km=fiber_loss_db_km,
            detection_eff=detection_efficiency,
            quantum_bit_error_rate=quantum_bit_error_rate
        )
        return {
            "protocol": "MDI-QKD",
            "data": df.to_dict(orient="records"),
            "statistics": {
                "min_key_rate": float(df["secret_key_rate_bps"].min()),
                "max_key_rate": float(df["secret_key_rate_bps"].max()),
                "mean_key_rate": float(df["secret_key_rate_bps"].mean())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na varredura: {str(e)}")


@app.post("/dashboard")
async def get_dashboard(
    bb84_params: BB84Parameters,
    mdi_params: MDIQKDParameters
) -> DashboardData:
    """Retorna dados consolidados para dashboard"""
    try:
        bb84_result = BB84Calculator.run_simulation(bb84_params)
        mdi_result = MDIQKDCalculator.run_simulation(mdi_params)

        return DashboardData(
            bb84_results=[bb84_result],
            mdi_qkd_results=[mdi_result],
            key_metrics={
                "bb84_key_rate": bb84_result.secret_key_rate_bps,
                "mdi_key_rate": mdi_result.secret_key_rate_bps,
                "bb84_qber": bb84_result.qber_percent,
                "mdi_qber": mdi_result.qber_percent
            },
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao gerar dashboard: {str(e)}")


@app.post("/simulate/bb84/stepbystep")
async def simulate_bb84_stepbystep(params: BB84Parameters) -> StepByStepResult:
    """
    Simula protocolo BB84 retornando todos os passos intermediarios de calculo.
    Cada passo inclui formula, variaveis de entrada e resultado parcial.
    """
    try:
        result = BB84StepByStepCalculator.run_simulation_with_steps(params)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro na simulacao step-by-step BB84: {str(e)}"
        )


@app.post("/simulate/mdi-qkd/stepbystep")
async def simulate_mdi_qkd_stepbystep(params: MDIQKDParameters) -> StepByStepResult:
    """
    Simula protocolo MDI-QKD retornando todos os passos intermediarios de calculo.
    Cada passo inclui formula, variaveis de entrada e resultado parcial.
    """
    try:
        result = MDIQKDStepByStepCalculator.run_simulation_with_steps(params)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro na simulacao step-by-step MDI-QKD: {str(e)}"
        )


@app.post("/sweep/bb84/stepbystep")
async def sweep_bb84_stepbystep(
    min_km: float = 0,
    max_km: float = 30,
    num_points: int = 30,
    fiber_loss_db_km: float = 0.22,
    detector_efficiency: float = 0.8,
    dark_count_rate: float = 1e-5
) -> SweepStepByStepResult:
    """
    Varredura de distancia para BB84 com rastreamento de passos.
    Retorna historico detalhado de cada passo para cada ponto de distancia.
    """
    try:
        if min_km < 0 or max_km < min_km or num_points < 2:
            raise ValueError("Parametros de varredura invalidos")
        if num_points > 100:
            num_points = 100

        result = SweepStepByStepCalculator.sweep_bb84_with_steps(
            min_km=min_km,
            max_km=max_km,
            num_points=num_points,
            fiber_loss_db_km=fiber_loss_db_km,
            detector_efficiency=detector_efficiency,
            dark_count_rate=dark_count_rate
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro na varredura step-by-step BB84: {str(e)}"
        )


@app.post("/sweep/mdi-qkd/stepbystep")
async def sweep_mdi_qkd_stepbystep(
    min_km: float = 0,
    max_km: float = 100,
    num_points: int = 30,
    fiber_loss_db_km: float = 0.22,
    detection_efficiency: float = 0.8,
    quantum_bit_error_rate: float = 0.1
) -> SweepStepByStepResult:
    """
    Varredura de distancia para MDI-QKD com rastreamento de passos.
    Retorna historico detalhado de cada passo para cada ponto de distancia.
    """
    try:
        if min_km < 0 or max_km < min_km or num_points < 2:
            raise ValueError("Parametros de varredura invalidos")
        if num_points > 100:
            num_points = 100
        if quantum_bit_error_rate < 0.05 or quantum_bit_error_rate > 0.2:
            raise ValueError("QBER deve estar entre 0.05 e 0.2")

        result = SweepStepByStepCalculator.sweep_mdi_qkd_with_steps(
            min_km=min_km,
            max_km=max_km,
            num_points=num_points,
            fiber_loss_db_km=fiber_loss_db_km,
            detection_efficiency=detection_efficiency,
            quantum_bit_error_rate=quantum_bit_error_rate
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro na varredura step-by-step MDI-QKD: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
