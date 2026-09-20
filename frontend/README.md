# Quantico Frontend

Frontend React em TypeScript para o simulador de Distribuição Quântica de Chaves (QKD). Suporta protocolos BB84 e MDI-QKD com visualização em tempo real de resultados.

## Requisitos

- Node.js 16.x ou superior
- npm ou yarn
- API backend rodando em http://localhost:8000

## Instalação

```bash
cd frontend
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env.local` e ajuste conforme necessário:

```bash
cp .env.example .env.local
```

A variável `VITE_API_URL` deve apontar para o backend (padrão: http://localhost:8000).

## Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## Testes

Execute os testes unitários:

```bash
npm run test
```

Modo watch (testes executam automaticamente ao salvar):

```bash
npm run test:watch
```

Gerar relatório de cobertura:

```bash
npm run test:coverage
```

## Verificação de Tipos

Execute a verificação de tipos TypeScript:

```bash
npm run type-check
```

## Arquitetura

### Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ParameterInput.tsx
│   ├── MetricCard.tsx
│   ├── DistanceSweepChart.tsx
│   └── ProtocolPanel.tsx
├── hooks/              # Custom hooks
│   └── useSimulation.ts
├── pages/              # Páginas principais
│   └── Dashboard.tsx
├── types/              # Definições de tipos TypeScript
│   └── index.ts
├── utils/              # Funções utilitárias
│   └── api.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Componentes Principais

- **ParameterInput**: Entrada de parâmetros com slider e campo numérico
- **MetricCard**: Card exibindo uma métrica com status visual
- **DistanceSweepChart**: Gráfico de varredura de distância com Recharts
- **ProtocolPanel**: Container para cada protocolo (BB84 ou MDI-QKD)
- **Dashboard**: Página principal com abas para os dois protocolos

### Hooks Customizados

- **useSimulation**: Gerencia chamadas para simulação única
- **useSweep**: Gerencia chamadas para varredura de distância

## Stack Técnico

- **React 18**: Framework UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Recharts**: Gráficos
- **Axios**: Cliente HTTP
- **Jest + React Testing Library**: Testes

## API Endpoints

A aplicação comunica com os seguintes endpoints do backend:

- `POST /simulate/bb84`: Simula protocolo BB84
- `POST /simulate/mdi-qkd`: Simula protocolo MDI-QKD
- `POST /sweep/bb84?min_km=20&max_km=100&...`: Varredura BB84
- `POST /sweep/mdi-qkd?min_km=20&max_km=100&...`: Varredura MDI-QKD

## Parâmetros Suportados

### BB84
- `distance_km`: Distância em quilômetros (0-100)
- `error_rate`: Taxa de erro (0-0.2)
- `efficiency`: Eficiência do sistema (0.1-1.0)
- `basis_choice_error`: Erro na escolha de base (0-0.1)
- `detector_efficiency`: Eficiência do detector (0.1-1.0)

### MDI-QKD
- `distance_km`: Distância em quilômetros (0-100)
- `error_rate`: Taxa de erro (0-0.2)
- `efficiency`: Eficiência do sistema (0.1-1.0)
- `twin_photon_rate`: Taxa de fótons gêmeos (0-1.0)
- `detection_efficiency`: Eficiência de detecção (0.1-1.0)

## Tratamento de Erros

A aplicação implementa:

- Validação de parâmetros antes de enviar à API
- Tratamento de erros HTTP com mensagens amigáveis
- Estados de carregamento durante requisições
- Timeout de 30 segundos para requisições

## Performance

- Renderização otimizada com React
- Gráficos responsivos com Recharts
- Código dividido por chunks no build
- Minificação automática de assets

## Contribuindo

Ao adicionar novo código:

1. Escreva testes para novos componentes/hooks
2. Mantenha a cobertura de testes acima de 50%
3. Execute `npm run type-check` antes de commitar
4. Siga as convenções de naming TypeScript

## License

Projeto Quantico - Rewrite 2024
