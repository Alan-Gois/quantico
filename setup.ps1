# Script para setup rápido do Quantico

Write-Host "=== Quantico Setup ===" -ForegroundColor Cyan

# 1. Criar venv
Write-Host "Criando virtual environment..." -ForegroundColor Yellow
python -m venv venv

# 2. Ativar venv
Write-Host "Ativando venv..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# 3. Instalar dependências
Write-Host "Instalando dependências Python..." -ForegroundColor Yellow
pip install -r requirements.txt

# 4. Rodar testes backend
Write-Host "Rodando testes..." -ForegroundColor Yellow
pytest tests/ -v

# 5. Iniciar API
Write-Host "`nAPI iniciando em http://localhost:8000" -ForegroundColor Green
Write-Host "Documentação: http://localhost:8000/docs" -ForegroundColor Green
python -m backend.api.main
