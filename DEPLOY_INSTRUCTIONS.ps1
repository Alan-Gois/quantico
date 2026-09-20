# ==========================================
# QUANTICO DEPLOYMENT SCRIPT
# ==========================================
# 
# Execute os comandos abaixo no PowerShell
# Substitua SEU_USUARIO_GITHUB pelo seu username
#
# ==========================================

# 1. Ir para a pasta do projeto
cd C:\Projetos\Quantico

# 2. Adicionar remote GitHub (substitua SEU_USUARIO_GITHUB)
git remote add origin https://github.com/SEU_USUARIO_GITHUB/quantico-rewrite.git

# 3. Fazer push para GitHub
git push -u origin main
git push -u origin develop
git push origin --tags

# 4. Verificar status
git remote -v
git branch -r

# ==========================================
# APÓS FAZER PUSH, PRÓXIMOS PASSOS:
# 
# A. Para Deploy Frontend (Vercel):
#    1. Acesse https://vercel.com/new
#    2. Conecte seu GitHub
#    3. Selecione quantico-rewrite
#    4. Configure root como "frontend"
#    5. Deploy automático
#
# B. Para Deploy Backend (Railway.app):
#    1. Acesse https://railway.app
#    2. Conecte GitHub
#    3. Novo projeto a partir de GitHub
#    4. Selecione quantico-rewrite
#    5. Configure PORT=8000
#    6. Deploy automático
#
# ==========================================
