# Comandos para Push para GitHub - Quantico Rewrite

Data: 2026-09-19
Status: Repositório Git 100% sincronizado localmente

## Pré-requisitos

Certifique-se de ter:
1. Conta GitHub criada
2. SSH key configurada ou token de autenticação
3. Repositório vazio criado no GitHub (quantico-rewrite ou similar)

## Passo 1: Criar Repositório no GitHub

Acesse https://github.com/new e crie:
- Nome: quantico-rewrite (ou seu nome preferido)
- Descrição: Quantum cryptography simulation platform (BB84 and MDI-QKD)
- Privacidade: Public ou Private (sua escolha)
- Deixe em branco - NÃO criar README, .gitignore, license

## Passo 2: Adicionar Remote ao Repositório Local

Abra PowerShell em C:\Projetos\Quantico e execute:

`powershell
# Se usar HTTPS (recomendado para primeira vez):
git remote add origin https://github.com/SEU_USUARIO/quantico-rewrite.git

# OU se usar SSH (mais seguro):
git remote add origin git@github.com:SEU_USUARIO/quantico-rewrite.git
`

Substitua SEU_USUARIO pelo seu nome de usuário GitHub.

## Passo 3: Fazer Push da Branch Main

`powershell
git push -u origin main
`

Esta é a branch de produção estável com o commit inicial.

## Passo 4: Fazer Push da Branch Develop

`powershell
git push -u origin develop
`

Esta é a branch de integração para desenvolvimento contínuo.

## Passo 5: Fazer Push das Tags

`powershell
git push origin v1.0.0-alpha
`

OU fazer push de todas as tags de uma vez:

`powershell
git push origin --tags
`

## Verificação Final

Para confirmar que tudo foi sincronizado corretamente:

`powershell
# Listar branches remotas
git branch -r

# Listar tags remotas
git ls-remote --tags origin

# Verificar status
git status
`

Esperado:
`
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
`

## Estrutura Esperada no GitHub

Após completar os passos acima, seu repositório terá:

main
  ├── Todos os arquivos do projeto
  ├── .git/ (commits)
  ├── backend/ (Python + FastAPI)
  ├── frontend/ (React + TypeScript)
  ├── config/ (Parâmetros)
  ├── tests/ (Testes unitários)
  ├── docs/ (Documentação)
  ├── ARCHITECTURE.md
  ├── CONTRIBUTING.md
  ├── CHANGELOG.md
  └── README.md

develop
  └── Mesmo conteúdo que main (branch de integração)

Tags
  └── v1.0.0-alpha (Commit ca59741)

## Comandos Rápidos (Tudo de Uma Vez)

Se quiser fazer tudo de uma só vez, execute esta sequência:

`powershell
cd C:\Projetos\Quantico

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/quantico-rewrite.git

# Push tudo: main, develop e tags
git push -u origin main
git push -u origin develop
git push origin --tags

# Verificar
git branch -r
git tag -l
`

## Troubleshooting

### Se receber erro "remote already exists"
`powershell
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/quantico-rewrite.git
`

### Se receber erro de autenticação HTTPS
Abra GitHub, vá em Settings > Developer settings > Personal access tokens
Crie um token com permissões 'repo' completas
Use o token como senha no git push

### Se receber erro de autenticação SSH
Adicione sua SSH key ao GitHub:
- Settings > SSH and GPG keys > New SSH key
- Cole sua chave pública (~/.ssh/id_rsa.pub)

## Próximos Passos

Após push bem-sucedido:

1. No GitHub, configure:
   - Branch protection rules para main (require reviews)
   - Default branch para main
   - Webhooks para CI/CD (GitHub Actions)

2. Configure CI/CD:
   - Crie .github/workflows/test.yml
   - Configure testes automáticos no push

3. Convide colaboradores:
   - Settings > Collaborators
   - Adicione desenvolvedores do projeto

## Estrutura de Branching (GitHub Flow)

A partir de agora, siga este fluxo:

`
main (produção)
  ↑
  ├─ pull request ← develop (integração)
  │                 ↑
  │                 ├─ feature/xyz (desenvolvimento)
  │                 └─ bugfix/abc (correção)
`

Exemplo de novo desenvolvimento:

`powershell
# Criar feature branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/dashboard-realtime

# Fazer commits...
git add .
git commit -m "feat: Implement real-time dashboard updates"

# Push para GitHub
git push -u origin feature/dashboard-realtime

# Abrir Pull Request no GitHub
# (develop ← feature/dashboard-realtime)

# Após aprovação e merge no GitHub
git checkout develop
git pull origin develop
`

---

Sincronizado por: F.R.I.D.A.Y.
Data: 2026-09-19
Repositório: C:\Projetos\Quantico
