# Guia de Integracao - StepByStepDashboard

## Introducao

O StepByStepDashboard foi criado como uma extensao da Fase 3 do projeto Quantico. Esta pagina exibe todos os passos intermediarios dos calculos de BB84 e MDI-QKD em tempo real, permitindo explorar cada formula, variavel e resultado parcial.

## Instalacao de Dependencias

Antes de usar, instale as dependencias necessarias (se ainda nao estiverem):

```bash
cd C:\Projetos\Quantico\frontend
npm install
```

As seguintes bibliotecas serao instaladas:
- Jest para testes
- React Testing Library para testes de componentes
- ts-jest para transformacao TypeScript
- identity-obj-proxy para mock de CSS

## Integracao com Roteamento Existente

### Opcao 1: Adicionar ao React Router Existente

Se o projeto ja usa React Router, adicione a rota no `src/App.tsx`:

```tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StepByStepDashboard from "./pages/StepByStepDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stepbystep" element={<StepByStepDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Opcao 2: Substituir Dashboard Atual

Se desejar usar apenas o StepByStepDashboard (recomendado para Fase 3):

```tsx
// src/App.tsx
import React from "react";
import StepByStepDashboard from "./pages/StepByStepDashboard";

function App() {
  return <StepByStepDashboard />;
}

export default App;
```

### Opcao 3: Abas dentro do Dashboard Existente

Se quiser manter o Dashboard existente com uma aba adicional:

```tsx
// src/pages/Dashboard.tsx
import React, { useState } from "react";
import StepByStepDashboard from "./StepByStepDashboard";
import ProtocolPanel from "../components/ProtocolPanel";

function Dashboard() {
  const [activeView, setActiveView] = useState<"classic" | "stepbystep">("classic");

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveView("classic")}
          className={`px-6 py-3 font-semibold ${
            activeView === "classic"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Visao Classica
        </button>
        <button
          onClick={() => setActiveView("stepbystep")}
          className={`px-6 py-3 font-semibold ${
            activeView === "stepbystep"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Passo a Passo
        </button>
      </div>

      {activeView === "classic" && <ProtocolPanel />}
      {activeView === "stepbystep" && <StepByStepDashboard />}
    </div>
  );
}

export default Dashboard;
```

## Uso Basico

### Exemplo Simples

```tsx
import React from "react";
import StepByStepDashboard from "./pages/StepByStepDashboard";

export default function App() {
  return <StepByStepDashboard />;
}
```

### Com Tema Customizado

```tsx
// src/App.tsx
import React from "react";
import StepByStepDashboard from "./pages/StepByStepDashboard";

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-full px-4 py-8">
        <StepByStepDashboard />
      </div>
    </div>
  );
}
```

## Configuracao de Parametros

Os parametros padrao para cada protocolo estao em `src/pages/StepByStepDashboard.tsx`:

### BB84
```typescript
const bb84Params = {
  distance_km: 10,          // 0-100 km
  error_rate: 0.01,         // 0-0.3
  efficiency: 0.8,          // 0.1-1.0
  basis_choice_error: 0.05, // 0-0.1
  detector_efficiency: 0.8, // 0.1-1.0
};
```

### MDI-QKD
```typescript
const mdiParams = {
  distance_km: 10,          // 0-100 km
  error_rate: 0.01,         // 0-0.3
  efficiency: 0.8,          // 0.1-1.0
  twin_photon_rate: 0.5,    // 0-1.0
  detection_efficiency: 0.8,// 0.1-1.0
};
```

Para customizar os valores iniciais, edite `StepByStepDashboard.tsx` antes de usar:

```tsx
const [bb84Params, setBb84Params] = useState<StepByStepSimulationParams>({
  distance_km: 20,          // Mudar valor padrao
  error_rate: 0.02,
  efficiency: 0.9,
  basis_choice_error: 0.01,
  detector_efficiency: 0.9,
});
```

## Variáveis de Ambiente

Configure a URL da API no arquivo `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Se nao configurada, usa `http://localhost:8000` por padrao.

## Rodando o Servidor de Desenvolvimento

```bash
cd C:\Projetos\Quantico\frontend
npm run dev
```

A aplicacao estara disponivel em `http://localhost:5173`

## Executando os Testes

```bash
# Rodar todos os testes
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Com relatorio de cobertura
npm run test:coverage
```

## Build para Producao

```bash
npm run build
```

Os arquivos otimizados estarao em `dist/`

## Pre-requisitos

1. **Node.js 16+** - Verifique com `node --version`
2. **Backend rodando** - API em `http://localhost:8000` (ou configure `VITE_API_URL`)
3. **npm ou yarn** - Para gerenciar dependencias

Teste a conexao com a API:

```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{"status": "ok", "timestamp": "2026-09-20T..."}
```

## Troubleshooting

### "API not responding"

1. Verifique se o backend esta rodando:
   ```bash
   curl http://localhost:8000/health
   ```

2. Verifique a variavel `VITE_API_URL` em `.env.local`

3. Verifique CORS no backend (deve permitir `localhost:5173`)

### "Cannot find module 'axios'"

Instale as dependencias:
```bash
npm install
```

### "Jest not found"

Instale devDependencies:
```bash
npm install --save-dev jest @testing-library/react
```

## Estrutura de Arquivos Criados

```
src/
├── types/
│   └── stepbystep.ts              # Types para step-by-step
├── hooks/
│   ├── useStepByStepSimulation.ts # Hook para API
│   └── useStepByStepSimulation.test.ts
├── components/
│   ├── StepCard.tsx               # Card de passo individual
│   ├── StepCard.test.tsx
│   ├── StepsContainer.tsx         # Container com lista
│   ├── StepsContainer.test.tsx
│   ├── ParametersPanel.tsx        # Painel de parametros
│   ├── ParametersPanel.test.tsx
│   ├── ResultsPanel.tsx           # Painel de resultados
│   ├── ResultsPanel.test.tsx
│   ├── ComparisonChart.tsx        # Grafico comparativo
│   └── ComparisonChart.test.tsx
└── pages/
    ├── StepByStepDashboard.tsx    # Pagina principal
    └── StepByStepDashboard.test.tsx

docs/
├── STEPBYSTEP.md                  # Documentacao completa
└── INTEGRATION_GUIDE.md           # Este arquivo
```

## Performance

### Otimizacoes Aplicadas

1. **Memoizacao**: Componentes usam React.memo e useCallback
2. **Cache Local**: Hook armazena ate 50 resultados em memoria
3. **Lazy Loading**: Gráficos carregam apenas quando visíveis
4. **Timeout**: Requisicoes timeout em 10s
5. **Code Splitting**: Vite cria chunks automaticamente

### Benchmark Esperado

- **Primeira simulacao**: 1-3 segundos (depende da API)
- **Cache hit**: < 100ms
- **Renderizacao**: < 500ms
- **Interatividade**: Sliders respondem instantaneamente

## Customizacao

### Adicionar Novo Protocolo

1. Adicione tipos em `src/types/stepbystep.ts`
2. Defina parametros em `StepByStepDashboard.tsx`
3. Adicione aba e lógica de switch
4. Crie testes para novo protocolo

### Customizar Cores

Edite as cores em cada componente ou centralize em um tema:

```tsx
// src/theme/colors.ts
export const colors = {
  bb84: "#3b82f6",      // Blue
  mdiQkd: "#8b5cf6",    // Purple
  success: "#22c55e",   // Green
  warning: "#eab308",   // Yellow
  error: "#ef4444",     // Red
};
```

## Suporte

Para problemas ou dúvidas:

1. Verifique a documentacao em `STEPBYSTEP.md`
2. Verifique os testes para exemplos de uso
3. Consulte o ARCHITECTURE.md do projeto

## Checklist de Integracao

- [ ] Node.js 16+ instalado
- [ ] Dependencias instaladas: `npm install`
- [ ] Backend rodando em `http://localhost:8000`
- [ ] `.env.local` configurado
- [ ] Rota adicionada em `App.tsx`
- [ ] Testes passando: `npm test`
- [ ] App rodando: `npm run dev`
- [ ] Endpoint `/health` respondendo
- [ ] Primeira simulacao executada com sucesso
- [ ] Componentes renderizando corretamente

---

**Data:** 26 de setembro de 2026
**Status:** PRONTO PARA INTEGRACAO
**Autor:** J.A.R.V.I.S.
