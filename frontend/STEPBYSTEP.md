# Documentacao - Fase 3: Frontend Step-by-Step

Data: 26 de setembro de 2026
Status: Implementacao Completa

## Visao Geral

A Fase 3 implementa uma interface React interativa que exibe os calculos sequenciais dos protocolos BB84 e MDI-QKD em tempo real. Cada passo intermediario e visualizado em cards expansiveis com formulas, variaveis e resultados parciais.

## Estrutura de Componentes

### Componentes Visuais

#### StepCard.tsx
Card individual que representa um passo de calculo.

**Props:**
- `step: CalculationStep` - Dados do passo (obrigatorio)
- `isCollapsed?: boolean` - Estado inicial colapsado (padrao: false)
- `onToggle?: () => void` - Callback quando expandir/colapsar

**Features:**
- Exibe numero, nome e formula do passo
- Mostra variaveis de entrada em grid
- Exibe resultado com unidade
- Status visual (completed/error)
- Animacao suave ao expandir/colapsar
- Gradiente de cor baseado no numero do passo

**Exemplo:**
```tsx
<StepCard
  step={{
    step: 1,
    name: "Atenuacao",
    formula: "A(L) = L × α",
    variables: { L: 10, α: 0.22 },
    result: 2.2,
    unit: "dB",
    status: "completed"
  }}
/>
```

#### StepsContainer.tsx
Container que exibe uma lista de StepCards com animacao em cascata.

**Props:**
- `steps: CalculationStep[]` - Array de passos (obrigatorio)
- `loading?: boolean` - Estado de carregamento (padrao: false)
- `error?: string | null` - Mensagem de erro (padrao: null)

**Features:**
- Animacao slideUp em cascata (delay progressivo)
- Linha conectora visual entre passos
- Botao "Expandir Todos" / "Recolher Todos"
- Estados loading, error e empty
- Expande automaticamente primeiros 3 passos se total <= 3

**Exemplo:**
```tsx
<StepsContainer
  steps={simulationData.steps}
  loading={isLoading}
  error={errorMessage}
/>
```

#### ParametersPanel.tsx
Painel com sliders para entrada de parametros.

**Props:**
- `title: string` - Titulo do painel (obrigatorio)
- `parameters: ParameterConfig[]` - Array de parametros (obrigatorio)
- `values: Record<string, number>` - Valores atuais (obrigatorio)
- `onChange: (key, value) => void` - Callback de mudanca (obrigatorio)
- `onSimulate?: () => void` - Callback de simulacao
- `loading?: boolean` - Estado de carregamento (padrao: false)

**Features:**
- Reutiliza ParameterInput existente
- Botao "Simular" opcional
- Estados loading/disabled
- Layout responsivo
- Descricao contextual

**Exemplo:**
```tsx
<ParametersPanel
  title="Parametros BB84"
  parameters={[
    { key: "distance_km", label: "Distancia", min: 0, max: 100, ... }
  ]}
  values={paramValues}
  onChange={handleParamChange}
  onSimulate={handleSimulate}
  loading={isLoading}
/>
```

#### ResultsPanel.tsx
Painel com metricas finais da simulacao.

**Props:**
- `title: string` - Titulo (obrigatorio)
- `results: Record<string, number>` - Resultados finais (obrigatorio)
- `metrics: ResultMetric[]` - Definicao de metricas (obrigatorio)
- `loading?: boolean` - Estado de carregamento (padrao: false)
- `error?: string | null` - Mensagem de erro (padrao: null)
- `secondaryData?: { label, value, unit }` - Dados secundarios (ex: tempo)

**Features:**
- Exibe metricas com formatacao automatica
- Status visual (success/warning/error/neutral)
- Suporta formatadores customizados
- Mostra tempo de execucao
- Tratamento de estados loading/error

**Exemplo:**
```tsx
<ResultsPanel
  title="Resultados Finais"
  results={simulationData.final_result}
  metrics={[
    { key: "secret_key_rate_bps", label: "Taxa de Chave", unit: "bps" },
    { key: "qber_percent", label: "QBER", unit: "%" }
  ]}
  loading={isLoading}
  secondaryData={{
    label: "Tempo de Execucao",
    value: simulationData.execution_time_ms,
    unit: "ms"
  }}
/>
```

#### ComparisonChart.tsx
Gráfico de barras comparativo entre BB84 e MDI-QKD.

**Props:**
- `title: string` - Titulo do grafico (obrigatorio)
- `data: ComparisonData[]` - Dados para comparacao (obrigatorio)
- `yAxisLabel?: string` - Label do eixo Y (padrao: "Valor")
- `loading?: boolean` - Estado de carregamento (padrao: false)
- `error?: string | null` - Mensagem de erro (padrao: null)

**Features:**
- Usa Recharts para renderizacao
- Barra dupla (BB84 vs MDI-QKD)
- Tooltip interativo
- Legenda com cores customizadas
- Responsivo

**Exemplo:**
```tsx
<ComparisonChart
  title="Comparacao entre Protocolos"
  data={[
    { label: "Taxa de Chave", bb84: 1000000, mdiQkd: 1500000 },
    { label: "QBER", bb84: 2.0, mdiQkd: 1.5 }
  ]}
/>
```

### Paginas

#### StepByStepDashboard.tsx
Página principal que integra todos os componentes.

**Features:**
- Layout 3 colunas: Parametros | Passos | Resultados
- Abas para BB84 e MDI-QKD
- Gerenciamento de estado de parametros
- Grafico comparativo quando ambos protocolos teem dados
- Mensagem inicial quando nenhuma simulacao foi executada
- Estados: loading, error, empty, success

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Simulador Quantico Passo a Passo            │
├────────────────────────────────────────────┤
│ [BB84]  [MDI-QKD]                          │
├──────────────┬──────────────┬──────────────┤
│              │              │              │
│  PARAMETROS  │   PASSOS     │  RESULTADOS  │
│              │              │              │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ Distance │ │ │ Passo 1  │ │ │Key Rate  │ │
│ │[========]│ │ │ Resultado│ │ │4.6M bps  │ │
│ │          │ │ └──────────┘ │ │          │ │
│ │ Error    │ │ ┌──────────┐ │ │QBER      │ │
│ │[========]│ │ │ Passo 2  │ │ │2.08%     │ │
│ │          │ │ │ Resultado│ │ │          │ │
│ │ Simulate │ │ └──────────┘ │ │Transmiss │ │
│ │[BUTTON  ]│ │ ...          │ │0.603     │ │
│ └──────────┘ │              │ └──────────┘ │
│              │              │              │
├──────────────────────────────────────────────┤
│ Comparacao entre Protocolos                  │
│ [Gráfico de Barras]                          │
└──────────────────────────────────────────────┘
```

### Hooks Customizados

#### useStepByStepSimulation()
Hook que gerencia requisicoes para simulacao passo-a-passo.

**Retorno:**
```typescript
{
  data: StepByStepResult | null,
  loading: boolean,
  error: string | null,
  runSimulation: (protocol, params) => Promise<StepByStepResult | null>
}
```

**Features:**
- Cache local de resultados (limite de 50 itens)
- Timeout de 10 segundos
- Tratamento robusto de erros
- Gera chave de cache baseada em protocolo + parametros
- Limite de cache automático (FIFO quando exceder 50)

**Exemplo:**
```typescript
const { data, loading, error, runSimulation } = useStepByStepSimulation();

await runSimulation("bb84", {
  distance_km: 10,
  error_rate: 0.01,
  efficiency: 0.8,
  basis_choice_error: 0.05,
  detector_efficiency: 0.8
});

if (loading) console.log("Simulando...");
if (error) console.error(error);
if (data) console.log(data.steps);
```

## Tipos TypeScript

### stepbystep.ts

```typescript
// Status de um passo
type StepStatus = "completed" | "error";

// Representacao de um passo de calculo
interface CalculationStep {
  step: number;                    // Numero do passo (1-indexed)
  name: string;                    // Nome descritivo
  formula: string;                 // Formula em notacao LaTeX/texto
  variables: Record<string, unknown>; // Variaveis de entrada
  result: number;                  // Resultado do calculo
  unit: string;                    // Unidade da grandeza
  status: StepStatus;              // Status (completed/error)
  description?: string;            // Descricao adicional
}

// Resultado completo com todos os passos
interface StepByStepResult {
  protocol: string;                // BB84 ou MDI-QKD
  distance_km: number;             // Distancia em km
  steps: CalculationStep[];        // Array de passos
  final_result: Record<string, number>; // Metricas finais
  execution_time_ms: number;       // Tempo de execucao em ms
}

// Configuracao de painel
interface StepPanelConfig {
  inputCount: number;              // Quantidade de sliders
  maxDistance: number;             // Distancia maxima
  minDistance: number;             // Distancia minima
}

// Metrica para ResultsPanel
interface ResultMetric {
  key: string;                     // Chave do resultado
  label: string;                   // Label exibido
  unit: string;                    // Unidade
  formatter?: (value: number) => string; // Formatador customizado
}
```

## Endpoints da API

### POST /simulate/bb84/stepbystep
Simula protocolo BB84 retornando passos intermediarios.

**Request:**
```json
{
  "distance_km": 10,
  "error_rate": 0.01,
  "efficiency": 0.8,
  "basis_choice_error": 0.05,
  "detector_efficiency": 0.8
}
```

**Response:**
```json
{
  "protocol": "BB84",
  "distance_km": 10,
  "steps": [
    {
      "step": 1,
      "name": "Atenuacao",
      "formula": "A(L) = L × α",
      "variables": {"L": 10, "α": 0.22},
      "result": 2.2,
      "unit": "dB",
      "status": "completed"
    }
  ],
  "final_result": {
    "secret_key_rate_bps": 4612343,
    "qber_percent": 2.0853,
    "transmissivity": 0.603659
  },
  "execution_time_ms": 1.23
}
```

### POST /simulate/mdi-qkd/stepbystep
Simula protocolo MDI-QKD retornando passos intermediarios.

(Mesmo formato que BB84, com parametros MDI-QKD)

## Testes

Cobertura completa com Jest + React Testing Library:

- `StepCard.test.tsx` - 8 testes
- `StepsContainer.test.tsx` - 10 testes
- `ParametersPanel.test.tsx` - 10 testes
- `ResultsPanel.test.tsx` - 13 testes
- `ComparisonChart.test.tsx` - 9 testes
- `useStepByStepSimulation.test.ts` - 10 testes
- `StepByStepDashboard.test.tsx` - 15 testes

**Total: 75+ testes**

## Executar Testes

```bash
# Testes unitarios
npm test

# Com cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

## Estilo e Responsividade

### Cores
- Primaria: Blue (bb84) - #3b82f6
- Secundaria: Purple (mdi-qkd) - #8b5cf6
- Status success: Green - #22c55e
- Status warning: Yellow - #eab308
- Status error: Red - #ef4444
- Fundo: Gray-50 - #f9fafb

### Layout
- Desktop (>= 1024px): 3 colunas (25% | 50% | 25%)
- Tablet (768px - 1023px): 2 colunas
- Mobile (< 768px): 1 coluna, stack vertical

### Animacoes
- StepCard expand: 300ms ease-in-out
- StepsContainer cascade: 500ms ease-out, delay 100ms incremental
- ComparisonChart transitions: suave com tooltips

## Performance

### Otimizacoes
- React.memo em componentes puros
- useCallback em callbacks de props
- Cache local de requisicoes (50 itens)
- Lazy loading de gráficos com Recharts
- Code splitting automatico com Vite

### Monitoramento
- Timeout de 10s nas requisicoes
- Limite de cache para evitar memory leak
- Tratamento de erros de rede robusto

## Integracao com Dashboard Existente

O StepByStepDashboard pode ser integrado ao App.tsx existente:

```tsx
// src/App.tsx
import StepByStepDashboard from "./pages/StepByStepDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/stepbystep" element={<StepByStepDashboard />} />
    </Routes>
  );
}
```

## Checklist de Implementacao

- [x] Types para step-by-step criados
- [x] Hook useStepByStepSimulation implementado
- [x] Componente StepCard criado e testado
- [x] Componente StepsContainer criado e testado
- [x] Componente ParametersPanel criado e testado
- [x] Componente ResultsPanel criado e testado
- [x] Componente ComparisonChart criado e testado
- [x] Pagina StepByStepDashboard criada e testada
- [x] Testes completos (75+ testes)
- [x] Documentacao inline em codigo
- [x] Zero TODOs e placeholders
- [x] TypeScript strict mode
- [x] Sem emojis (Stark Protocol)
- [x] Responsivo (mobile, tablet, desktop)
- [x] Tratamento de erros robusto
- [x] Performance otimizada

## Status: PRONTO PARA PRODUCAO

Todos os componentes, hooks e testes foram implementados conforme especificacao.
Nenhum TODO ou placeholder deixado.
Codigo pronto para integracao com Dashboard existente.

---

**Implementado por:** J.A.R.V.I.S. (Senior Software Engineer)
**Data:** 26 de setembro de 2026
**Status:** CONCLUIDO
