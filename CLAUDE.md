# Quantico Rewrite — Python + Frontend Interativo

Projeto de reescrita dos cálculos de simulação quântica (BB84 e MDI-QKD) de Excel para Python com frontend interativo em tempo real.

## Arquitetura

```
Quantico/
├── backend/                  # Python backend
│   ├── api/                  # FastAPI endpoints
│   ├── calculations/         # Lógica de cálculo com pandas
│   └── models/               # Modelos de dados (dataclasses, Pydantic)
├── frontend/                 # React + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas principais
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Utilitários
│   └── public/               # Assets estáticos
├── config/                   # Arquivos de configuração
├── docs/                     # Documentação (ADRs, arquitetura)
└── tests/                    # Testes (backend + frontend)
```

## Stack Técnico

### Backend
- **Python 3.10+**
- **pandas**: Cálculos tabulares e simulações
- **FastAPI**: API REST
- **Pydantic**: Validação de dados
- **NumPy/SciPy**: Computações científicas

### Frontend
- **React 18+** com TypeScript
- **Vite**: Build tool (rápido)
- **TailwindCSS**: Styling (conforme Figma)
- **Recharts**: Dashboards e gráficos
- **React Query**: Sincronização de dados
- **Figma design system**: Design tokens importados

## Fluxo de Dados

1. Usuário define parâmetros no frontend
2. Frontend envia para backend via REST API
3. Backend calcula com pandas
4. Backend retorna resultados + agregações
5. Frontend renderiza dashboards em tempo real

## Regras de Desenvolvimento

- **Sem emojis**: Formatação profissional com Markdown simples
- **Código testável**: Toda função com cálculos deve ter testes
- **Separação clara**: Backend é independente do frontend (troca de UI não quebra lógica)
- **Variáveis em config**: Parâmetros fixos em `config/parameters.json`
- **Documentação inline**: Comentários para lógica não óbvia
- **Git atomicamente**: Commits pequenos por funcionalidade

## Próximos Passos

1. E.D.I.T.H cria CHECKBOX_MASTER com fases
2. J.A.R.V.I.S implementa backend estruturado
3. Frontend com design do Figma
4. Testes e integração
5. Deploy

---

Fonte de verdade de progresso: `C:\Projetos\Obsidian\Muryo Kusho\Projetos\Quantico_Rewrite\00_CHECKBOX_MASTER.md`
