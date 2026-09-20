# COMANDOS PARA FAZER PUSH PARA GITHUB - Quantico Rewrite
# Data: 2026-09-19
# Execução: PowerShell em C:\Projetos\Quantico

# =============================
# PASSO 1: Verificar status local
# =============================
cd C:\Projetos\Quantico
git status
git branch -a
git tag -l

# =============================
# PASSO 2: Criar repositório no GitHub
# =============================
# Abra https://github.com/new e crie um repositório vazio:
# - Nome: quantico-rewrite
# - Não marque "Initialize this repository with"
# - Não criar README, .gitignore, ou license

# =============================
# PASSO 3: Adicionar o remote (escolha uma opção)
# =============================

# OPCAO A: HTTPS (recomendado se não tem SSH configurado)
git remote add origin https://github.com/SEU_USUARIO/quantico-rewrite.git

# OPCAO B: SSH (mais seguro, requer SSH key no GitHub)
# git remote add origin git@github.com:SEU_USUARIO/quantico-rewrite.git

# Substitua SEU_USUARIO pelo seu nome de usuário no GitHub

# =============================
# PASSO 4: Fazer push da branch main
# =============================
git push -u origin main

# Isso pode pedir autenticação:
# - Se usar HTTPS: Cole seu GitHub token como senha
# - Se usar SSH: Use sua passphrase da SSH key

# =============================
# PASSO 5: Fazer push da branch develop
# =============================
git push -u origin develop

# =============================
# PASSO 6: Fazer push de todas as tags
# =============================
git push origin --tags

# Ou fazer push da tag específica:
# git push origin v1.0.0-alpha

# =============================
# PASSO 7: Verificar sincronização
# =============================
git branch -r              # Deve mostrar origin/main, origin/develop
git ls-remote --tags origin  # Deve mostrar v1.0.0-alpha
git status                 # Deve estar limpo

# Esperado:
# On branch main
# Your branch is up to date with 'origin/main'.
# nothing to commit, working tree clean

# =============================
# RESUMO DOS COMANDOS
# =============================
# Copie e execute exatamente nesta ordem:

# 1. Entre no diretório
cd C:\Projetos\Quantico

# 2. Adicione o remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/quantico-rewrite.git

# 3. Faça push de tudo
git push -u origin main
git push -u origin develop
git push origin --tags

# 4. Verifique
git branch -r
git ls-remote --tags origin

# Pronto! Seu repositório está sincronizado com GitHub.

# =============================
# TROUBLESHOOTING
# =============================

# Se receber: "fatal: remote origin already exists"
# Execute:
git remote remove origin
# Depois execute novamente o passo 3

# Se receber: "fatal: Authentication failed"
# HTTPS: Vá em GitHub > Settings > Developer settings > Tokens > Personal access tokens
#        Crie um novo token com permissão 'repo' e use como senha
# SSH: Vá em GitHub > Settings > SSH and GPG keys > New SSH key
#      Cole o conteúdo de ~/.ssh/id_rsa.pub

# Se receber: "error: src refspec main does not match any"
# Significa que não há commit na branch main
# Verifique com: git log --oneline
# Todos os commits devem estar em main

# =============================
# PROXIMO DESENVOLVIMENTO
# =============================

# Para novas features, sempre partir de develop:

git checkout develop
git pull origin develop
git checkout -b feature/sua-feature

# ... fazer commits ...

git push -u origin feature/sua-feature

# Depois abrir Pull Request no GitHub (develop ← feature/sua-feature)

