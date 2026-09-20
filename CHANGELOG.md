# Changelog - Quantico Rewrite

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha] - 2026-09-19

### Added

- Backend Python com FastAPI implementado
  - Endpoints POST /simulate/bb84 e POST /simulate/mdi-qkd
  - Endpoints POST /sweep/bb84 e POST /sweep/mdi-qkd para varredura de distância
  - Validação de entrada com Pydantic
  - Documentação automática Swagger em /docs

- Protocolo BB84 totalmente implementado
  - Cálculo de Atenuação quântica
  - Cálculo de Transmissividade
  - Cálculo de Qubit Loss Rate
  - Cálculo de Mean Photon Number
  - Cálculo de QBER
  - Cálculo de Secret Key Rate

- Protocolo MDI-QKD totalmente implementado
  - Cálculos específicos de detecção interferométrica
  - Parâmetros de detecção Bell

- Infraestrutura
  - Docker e Docker Compose configurados
  - requirements.txt com todas as dependências
  - config/parameters.json com constantes físicas
  - .gitignore e .dockerignore configurados

- Testes
  - Suite de testes BB84 com pytest
  - Testes de validação de fórmulas

- Documentação
  - README.md com quick start
  - STATUS.md com status de implementação
  - ARCHITECTURE.md com visão da arquitetura
  - CONTRIBUTING.md com guia de contribuição
  - CHANGELOG.md (este arquivo)

- Frontend
  - Projeto React com TypeScript e Vite
  - Configuração TailwindCSS
  - Configuração Jest para testes

### In Progress

- Componentes React (Dashboard, ParameterInput, MetricCard)
- Integração frontend-backend end-to-end
- Testes de componentes React

### Planned

- CI/CD com GitHub Actions
- Testes de performance
- Deploy em staging/produção

---

Versão atual: 1.0.0-alpha
Próximas: 1.0.0-beta, 1.0.0

Mantido por: F.R.I.D.A.Y.
Última atualização: 2026-09-19
