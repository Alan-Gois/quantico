# Arquitetura - Quantico Rewrite

Data de criacao: 2026-09-19
Versao: 1.0.0-alpha

## Visão Geral

O projeto Quantico Rewrite é uma reescrita profissional de simulações quânticas (BB84 e MDI-QKD) originalmente desenvolvidas em Excel, portadas para Python com frontend interativo em tempo real.

A arquitetura segue os princípios de Clean Architecture e SOLID, com separação clara entre backend (API REST) e frontend (React + TypeScript).

## Estrutura de Pastas

`
Quantico/
├── backend/                  # Python + FastAPI
│   ├── api/
│   │   └── main.py          # FastAPI application + endpoints
│   ├── calculations/
│   │   ├── __init__.py
│   │   └── quantum_protocols.py  # Lógica de BB84 e MDI-QKD
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py        # Pydantic models (request/response)
│   └── Dockerfile            # Container para backend
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas principais (Dashboard)
│   │   ├── hooks/            # Custom hooks (useSimulation)
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilitários (API client)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/               # Assets estáticos
│   ├── Dockerfile            # Container para frontend
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── package.json
├── config/
│   └── parameters.json       # Parâmetros globais (física quântica)
├── tests/
│   └── test_bb84.py          # Testes unitários do backend
├── docs/                     # Documentação e ADRs
├── docker-compose.yml        # Orquestração de containers
├── requirements.txt          # Dependências Python
├── .gitignore
├── .dockerignore
├── CLAUDE.md                 # Diretrizes do projeto
├── README.md                 # Quick start
├── STATUS.md                 # Status atual
└── ARCHITECTURE.md           # Este arquivo
`

## Stack Técnico

### Backend

Linguagem: Python 3.10+
Framework: FastAPI (async)
Validação: Pydantic v2
Cálculos: pandas, NumPy, SciPy
Testes: pytest

Dependências principais:
- fastapi: Framework web
- uvicorn: ASGI server
- pydantic: Validação de dados
- pandas: Cálculos tabulares
- numpy: Operações numéricas
- scipy: Computação científica

### Frontend

Linguagem: TypeScript 5+
Framework: React 18+
Build tool: Vite (rápido, moderno)
Styling: TailwindCSS (utility-first)
Visualização: Recharts (gráficos)
HTTP: fetch API (nativo)
Testes: Jest + React Testing Library

Dependências principais:
- react: UI library
- react-dom: React para web
- vite: Build bundler
- typescript: Tipagem estática
- tailwindcss: Styling framework
- recharts: Charting library

### DevOps

Containerização: Docker + Docker Compose
Orquestração: docker-compose (desenvolvimento)
Versão de imagens: tags semânticas (v1.0.0-alpha)

## Fluxo de Dados

### Simulação BB84

1. Frontend envia parâmetros via POST /simulate/bb84
2. Backend executa sequência de cálculos
3. Backend retorna JSON com resultados
4. Frontend renderiza em tempo real

### Varredura de Distância

POST /sweep/{protocolo} varre distância de 1km até 1000km

## Decisões Técnicas

### 1. FastAPI em vez de Flask
- Suporte nativo para async/await
- Validação automática com Pydantic
- Documentação Swagger automática

### 2. React + TypeScript
- Ecosistema maduro
- TypeScript evita erros em tempo de execução
- Compatível com design system do Figma

### 3. Vite em vez de Create React App
- Tempo de build 10x mais rápido
- Suporte nativo para TypeScript
- Melhor desenvolvimento iterativo

### 4. TailwindCSS
- Utility-first classes são rápidas
- Menor bundle size
- Fácil respeitar design tokens do Figma

### 5. Docker para containerização
- Ambiente isolado
- Reproduzibilidade
- Facilita deployment

## Padrões e Convenções

### Backend (Python)
- snake_case para módulos, funções e variáveis
- PascalCase para classes
- UPPER_CASE para constantes
- Type hints em todas as funções públicas
- Docstrings em numpy style

### Frontend (TypeScript)
- PascalCase para componentes
- camelCase para hooks, funções, variáveis
- PascalCase para tipos/interfaces
- Props sempre tipadas
- Sem console.log em produção

Sem emojis em código, comentários ou mensagens.

## Testing

Backend:
- pytest com fixtures
- Cobertura mínima 80%

Frontend:
- Jest + React Testing Library
- Testes de componentes
- Testes de integração

## Deployment

Local (desenvolvimento):
`ash
docker-compose up
`

## Próximos Passos

1. Implementação completa do frontend
2. Testes end-to-end
3. Setup de CI/CD (GitHub Actions)
4. Deploy em staging/produção

---

Mantido por: F.R.I.D.A.Y.
Última atualização: 2026-09-19
