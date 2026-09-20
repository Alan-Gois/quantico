# Arquitetura do Frontend Quantico

## Visão Geral

O frontend Quantico é uma aplicação React TypeScript que permite aos usuários simular protocolos de Distribuição Quântica de Chaves (QKD). Oferece uma interface intuitiva com dois protocolos principais: BB84 e MDI-QKD.

## Princípios de Design

1. **Separação de Responsabilidades**: Componentes, hooks e utilitários possuem responsabilidades bem definidas
2. **Reutilização**: Componentes genéricos (ParameterInput, MetricCard) são reutilizáveis em múltiplos contextos
3. **Type Safety**: TypeScript garante segurança de tipos em toda a codebase
4. **Testabilidade**: Componentes e hooks são testáveis através de Jest e React Testing Library
5. **Performance**: Renderização otimizada com React, gráficos responsivos

## Estrutura de Diretórios

```
src/
├── components/          # Componentes React reutilizáveis
├── hooks/              # Custom hooks (useSimulation, useSweep)
├── pages/              # Componentes de página (Dashboard)
├── types/              # Definições TypeScript
├── utils/              # Funções utilitárias (api client, validação)
├── App.tsx             # Componente raiz
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## Componentes

### ParameterInput
- Renderiza slider + input numérico para ajuste de parâmetros
- Mantém sincronização entre slider e input
- Suporta `min`, `max`, `step`, `unit`, `precision`
- Callback `onChange` quando valor muda

### MetricCard
- Exibe uma métrica com valor, unidade e status visual
- Status pode ser: success, warning, error, neutral
- Suporta ícone opcional e descrição
- Usado para exibir resultados da simulação

### DistanceSweepChart
- Gráfico composto com Recharts
- Exibe Taxa de Chave e QBER em função da distância
- Responsivo e com tooltip interativo
- Trata estados: carregando, erro, sem dados

### ProtocolPanel
- Container para cada protocolo (BB84 ou MDI-QKD)
- Gerencia estado de parâmetros
- Orquestra chamadas a useSimulation e useSweep
- Layout em duas colunas: parâmetros (esquerda) e resultados (direita)

### Dashboard
- Página principal com abas para os dois protocolos
- Header e footer
- Controla qual ProtocolPanel é exibido

## Hooks Customizados

### useSimulation
Gerencia estado e requisições para simulação única:

```typescript
const { simulationData, simulationLoading, simulationError, runSimulation } = 
  useSimulation();

await runSimulation("bb84", { distance_km: 50, ... });
```

### useSweep
Gerencia estado e requisições para varredura de distância:

```typescript
const { sweepData, sweepLoading, sweepError, runSweep } = 
  useSweep();

await runSweep("mdi-qkd", { error_rate: 0.01 }, 20, 100);
```

## Tipos TypeScript

### ProtocolParameters
Interface base com parâmetros comuns a todos os protocolos.

### SimulationResult
Resultado de uma simulação única:
- `distance_km`: Distância da comunicação
- `sift_rate`: Taxa de eventos após seleção de base
- `qber`: Taxa de erro quântico
- `key_rate`: Taxa de chave obtida
- `secure`: Booleano indicando segurança

### SweepResult
Resultado de uma varredura de distância:
- `distances`: Array de distâncias testadas
- `sift_rates`, `qbers`, `key_rates`: Arrays paralelos de métricas
- `secure_ranges`: Array booleano indicando segurança em cada distância

## Fluxo de Dados

1. Usuário ajusta parâmetros via ParameterInput
2. ProtocolPanel atualiza estado local `paramValues`
3. Usuário clica "Simular" ou "Varrer"
4. Hook (useSimulation ou useSweep) faz requisição à API
5. Resposta atualiza estado no hook
6. Componentes renderizam novos dados (MetricCard, DistanceSweepChart)

## Comunicação com API

Cliente Axios configurado em `src/utils/api.ts`:
- Base URL: `http://localhost:8000` (configurável via `.env`)
- Timeout: 30 segundos
- Content-Type: application/json

Endpoints consumidos:
- `POST /simulate/bb84`
- `POST /simulate/mdi-qkd`
- `POST /sweep/bb84?min_km=20&max_km=100&...`
- `POST /sweep/mdi-qkd?min_km=20&max_km=100&...`

## Tratamento de Erros

1. **Validação de Parâmetros**: Função `validateProtocolParameters` em `utils/api.ts`
2. **Tratamento de Resposta**: Função `handleApiError` converte AxiosError em string amigável
3. **Feedback ao Usuário**: Mensagens de erro exibidas em cards vermelhos
4. **Estados de Carregamento**: Botões desabilitados durante requisições

## Styling

- **TailwindCSS** para utilitários CSS
- **Variáveis de cor** customizadas: `quantum-50`, `quantum-500`, `quantum-900`
- Layout responsivo com `grid` e `flex`
- Dark mode pronto para implementação (em comentários)

## Testes

### Estratégia de Teste
- Testes unitários para componentes (ParameterInput, MetricCard)
- Testes de hooks (useSimulation, useSweep)
- Cobertura mínima de 50%

### Frameworks
- **Jest**: Test runner
- **React Testing Library**: Renderização e queries de componentes
- **jest-dom**: Matchers customizados

### Exemplo de Teste
```typescript
it("calls onChange when slider is adjusted", () => {
  render(
    <ParameterInput
      label="Distance"
      value={50}
      min={0}
      max={100}
      onChange={mockOnChange}
    />
  );
  
  fireEvent.change(slider, { target: { value: "75" } });
  expect(mockOnChange).toHaveBeenCalledWith(75);
});
```

## Performance e Otimizações

1. **React.memo**: Componentes simples memoizados
2. **useCallback**: Callbacks em hooks memoizados para evitar re-renders
3. **Code Splitting**: Vite divide automaticamente em chunks
4. **Lazy Loading**: Dashboard pode carregar ProtocolPanel sob demanda

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | http://localhost:8000 | URL base da API |

## Build e Deploy

### Desenvolvimento
```bash
npm run dev
```
Servidor em http://localhost:5173 com hot reload.

### Produção
```bash
npm run build
```
Gera arquivos otimizados em `dist/`.

## Decisões Arquiteturais

### Por que Recharts e não D3?
- Recharts é mais simples para gráficos comuns
- Composição React natural
- Bundle menor

### Por que TailwindCSS e não CSS-in-JS?
- Tamanho de bundle reduzido
- Utilities reutilizáveis
- Sem runtime overhead

### Por que Axios e não Fetch?
- Melhor tratamento de erros
- Interceptadores automáticos
- Compatibilidade com IE (se necessário)

### Por que TypeScript?
- Type safety reduz bugs
- IDE autocomplete melhorado
- Self-documenting code

## Roadmap Futuro

1. Autenticação de usuário
2. Persistência de preferências (localStorage)
3. Dark mode completo
4. Gráficos adicionais (histogramas, análise espectral)
5. Export de resultados (PNG, CSV)
6. Integração com backend WebSocket para tempo real
7. Mobile-first redesign

## Referências

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Recharts Docs](https://recharts.org/)
