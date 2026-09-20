# Status do Projeto Quantico Rewrite

Data: 2026-09-19
Status: [Em Construção] Frontend em Desenvolvimento

## Concluído

### Backend Python (100%)
- [x] Estrutura de pastas
- [x] FastAPI configurado com CORS
- [x] Modelos Pydantic (schemas)
- [x] Calculadora BB84 (todos os cálculos)
- [x] Calculadora MDI-QKD (todos os cálculos)
- [x] Gerador de varredura de distância
- [x] Endpoints da API:
  - POST /simulate/bb84
  - POST /simulate/mdi-qkd
  - POST /sweep/bb84
  - POST /sweep/mdi-qkd
  - POST /dashboard
- [x] Testes unitários (BB84)
- [x] requirements.txt

### Configuração do Projeto (100%)
- [x] CLAUDE.md (guia do projeto)
- [x] README.md (quick start)
- [x] config/parameters.json
- [x] .gitignore
- [x] setup.ps1 (script de setup)
- [x] E.D.I.T.H Checkbox Master (6 fases, 23 milestones, 88 subtarefas)

### Frontend (Em Construção - J.A.R.V.I.S.)
- [ ] Componentes React:
  - [ ] ParameterInput.tsx
  - [ ] MetricCard.tsx
  - [ ] DistanceSweepChart.tsx
  - [ ] ProtocolPanel.tsx
- [ ] Hook de simulação (useSimulation.ts)
- [ ] Página Dashboard.tsx
- [ ] Configuração Vite (pronto)
- [ ] Configuração TailwindCSS (pronto)
- [ ] TypeScript config (pronto)
- [ ] index.html (pronto)
- [ ] package.json (pronto)

## Próximas Ações

1. Aguardar conclusão do frontend de J.A.R.V.I.S.
2. Integração frontend + backend (teste end-to-end)
3. Otimização de performance
4. Documentação adicional
5. Deploy

## Como Rodar

### Backend
```bash
cd C:\Projetos\Quantico
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m backend.api.main
```

Acesso: http://localhost:8000/docs

### Frontend (após J.A.R.V.I.S. completar)
```bash
cd frontend
npm install
npm run dev
```

Acesso: http://localhost:5173

## Arquitetura

Backend calcula com pandas:
- BB84: Atenuação → Transmissividade → Qubit Loss → Mean Photon → QBER → Secret Key Rate
- MDI-QKD: Similar, mas com fórmulas de detecção interferométrica

Frontend em React:
- Sliders para ajustar parâmetros
- Campos de entrada para valores
- Dashboard dinâmico com Recharts
- Gráficos de varredura de distância
- Atualização em tempo real

## Arquivos Principais

```
backend/
├── api/main.py              ← FastAPI endpoints
├── calculations/
│   └── quantum_protocols.py ← Lógica de cálculo
└── models/
    └── schemas.py           ← Schemas Pydantic

frontend/
├── src/components/          ← Componentes React (em desenvolvimento)
├── src/pages/               ← Páginas (em desenvolvimento)
├── src/hooks/               ← Custom hooks (em desenvolvimento)
└── vite.config.ts          ← Build config (pronto)

tests/
└── test_bb84.py            ← Testes unitários
```

---

Fonte de verdade do progresso geral:
`C:\Projetos\Obsidian\Muryo Kusho\Projetos\Quantico_Rewrite\00_CHECKBOX_MASTER.md`
