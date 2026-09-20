# Quantico — Rewrite em Python

Reescrita profissional de simulações quânticas (BB84 e MDI-QKD) de Excel para Python com frontend interativo em tempo real.

## Status do Projeto

**Estrutura:** Criada e organizada com 6 fases, 23 milestones e 88 subtarefas

Acompanhe o progresso em:
```
C:\Projetos\Obsidian\Muryo Kusho\Projetos\Quantico_Rewrite\00_CHECKBOX_MASTER.md
```

## Começar Rápido

### 1. Setup Backend

```bash
cd C:\Projetos\Quantico
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Rodar a API

```bash
python -m backend.api.main
```

A API estará disponível em `http://localhost:8000` com documentação em `/docs`

### 3. Testar Endpoints

```bash
# BB84
curl -X POST "http://localhost:8000/simulate/bb84" \
  -H "Content-Type: application/json" \
  -d '{"distance_km": 10}'

# MDI-QKD
curl -X POST "http://localhost:8000/simulate/mdi-qkd" \
  -H "Content-Type: application/json" \
  -d '{"distance_km": 20}'
```

## Arquitetura

```
Quantico/
├── backend/
│   ├── api/              # FastAPI endpoints
│   ├── calculations/     # Lógica de cálculo
│   └── models/           # Schemas Pydantic
├── frontend/             # React (em desenvolvimento)
├── config/               # Configurações
└── tests/                # Testes
```

## Próximos Passos

1. Frontend React com Vite
2. Dashboard interativo com Recharts
3. Integração com design do Figma
4. Testes automatizados
5. Deploy

Ver detalhes em `CLAUDE.md`
