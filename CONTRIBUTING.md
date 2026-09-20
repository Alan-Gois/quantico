# Guia de Contribuição - Quantico Rewrite

Obrigado por contribuir ao projeto Quantico Rewrite. Este documento estabelece os padrões e procedimentos para desenvolvimento seguro e coeso.

## Estrutura de Branches

`
main          <- Produção estável (tags de versão aqui)
├── develop   <- Integração das features (branch principal de dev)
│   ├── feature/bb84-optimization
│   ├── feature/ui-components
│   └── bugfix/qber-calculation
`

### Nomes de Branches

Use o padrão:
- feature/<descrição-curta> para novas funcionalidades
- bugfix/<descrição-curta> para correções
- docs/<descrição-curta> para documentação
- chore/<descrição-curta> para limpeza/refatoração

## Processo de Desenvolvimento

### 1. Criar Feature Branch

`ash
git checkout develop
git pull origin develop
git checkout -b feature/<seu-nome>
`

### 2. Fazer Commits Pequenos e Atômicos

Formato de mensagem:
`
[TIPO] Descrição breve no imperativo

Descrição mais detalhada explicando o quê e por quê.
`

Tipos:
- feat: Nova funcionalidade
- fix: Correção de bug
- docs: Documentação
- style: Formatação (sem mudança lógica)
- refactor: Refatoração de código
- test: Testes
- chore: Build, setup, dependências

### 3. Manter Código Limpo

Backend (Python):
- Sem linhas maiores que 100 caracteres
- Docstrings em todas as funções públicas
- Type hints em parâmetros e retorno
- Sem imports não utilizados

Frontend (TypeScript):
- Sem tipos implícitos
- Componentes pequenos e reutilizáveis
- Props sempre tipadas
- Sem console.log em production
- Sem emojis em comentários ou código

### 4. Testes

Antes de fazer push:

Backend:
`ash
python -m pytest tests/ -v --cov=backend
`

Frontend:
`ash
npm test -- --coverage
`

### 5. Push e Pull Request

`ash
git push origin feature/<seu-nome>
`

Abra PR no GitHub com descrição clara.

## Versionamento Semântico

Formato: MAJOR.MINOR.PATCH-PRERELEASE

Exemplo: 1.0.0-alpha, 1.0.0-beta, 1.0.0

Criar tag:
`ash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
`

## Ambiente Local

### Setup Inicial

Backend:
`ash
cd C:\Projetos\Quantico
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
`

Frontend:
`ash
cd frontend
npm install
`

### Desenvolvimento Local

Terminal 1 (Backend):
`ash
python -m backend.api.main
`

Terminal 2 (Frontend):
`ash
npm run dev
`

Acesso:
- Backend: http://localhost:8000/docs
- Frontend: http://localhost:5173

---

Obrigado por contribuir com código limpo, testado e bem documentado!
