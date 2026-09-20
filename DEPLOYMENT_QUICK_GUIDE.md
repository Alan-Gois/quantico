# Quick Deployment Guide — Quantico Rewrite

## Opção 1: Vercel (Frontend) + Railway (Backend)

### A. Deploy Frontend com Vercel

1. **Acesse:** https://vercel.com/new
2. **Conecte GitHub** (autorize Vercel)
3. **Selecione repositório:** `quantico-rewrite`
4. **Configure:**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
5. **Deploy!** ✓

**Resultado:** `https://quantico-rewrite.vercel.app`

---

### B. Deploy Backend com Railway.app

1. **Acesse:** https://railway.app
2. **Conecte GitHub**
3. **Novo Projeto** → GitHub
4. **Selecione:** `quantico-rewrite`
5. **Configure variáveis:**
   ```
   PORT=8000
   ```
6. **Deploy!** ✓

**Resultado:** `https://quantico-rewrite-production.up.railway.app`

---

## Opção 2: Render.com (Backend) + Vercel (Frontend)

### Backend em Render.com

1. **Acesse:** https://render.com
2. **New + Web Service**
3. **Conecte GitHub**
4. **Configure:**
   - Name: `quantico-backend`
   - Root directory: `/`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn backend.api.main:app --host 0.0.0.0 --port 8000`
5. **Deploy!** ✓

**Resultado:** `https://quantico-backend.onrender.com`

---

## Pré-requisito: GitHub Push

```powershell
cd C:\Projetos\Quantico

git remote add origin https://github.com/SEU_USUARIO/quantico-rewrite.git
git push -u origin main
git push -u origin develop
git push origin --tags
```

---

## Arquitetura Final

```
┌─────────────────────────────────────────────┐
│  Frontend (React)                           │
│  https://quantico-rewrite.vercel.app        │
└────────────────┬────────────────────────────┘
                 │ HTTP Requests
                 │ (CORS enabled)
                 ▼
┌─────────────────────────────────────────────┐
│  Backend (Python)                           │
│  https://quantico-rewrite-prod.railway.app  │
└─────────────────────────────────────────────┘
```

---

## Variáveis de Ambiente

### Backend

Na plataforma de deployment, adicione:
```
PORT=8000
PYTHONUNBUFFERED=1
```

### Frontend

No `frontend/.env.production`:
```
VITE_API_URL=https://quantico-rewrite-prod.railway.app
```

---

## Testes Pós-Deployment

### Verificar Backend

```bash
curl https://quantico-rewrite-prod.railway.app/health
```

Resposta esperada:
```json
{"status": "ok", "timestamp": "2026-09-19T..."}
```

### Acessar Frontend

1. Abra: https://quantico-rewrite.vercel.app
2. Coloque distância = 15 km
3. Veja os valores mudando em tempo real

---

## Links Finais (Após Deploy)

| Componente | URL |
|-----------|-----|
| Frontend | `https://quantico-rewrite.vercel.app` |
| Backend API | `https://quantico-rewrite-prod.railway.app` |
| API Docs | `https://quantico-rewrite-prod.railway.app/docs` |
| GitHub Repo | `https://github.com/SEU_USUARIO/quantico-rewrite` |

---

## Troubleshooting

### CORS Error
No backend `api/main.py`, atualize:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://quantico-rewrite.vercel.app",
        "http://localhost:3000"
    ],
    ...
)
```

### 502 Bad Gateway
- Verificar se PORT=8000 está definido
- Checar logs na plataforma

### Build fails
- Certifique-se que `.gitignore` não exclui `package.json`
- Frontend: certifique `node_modules` está em .gitignore

---

## Próximas Melhorias

- [ ] GitHub Actions para CI/CD automático
- [ ] Testes automatizados a cada push
- [ ] Monitoramento com Sentry
- [ ] Analytics com Plausible
- [ ] Custom domain

---

**Tempo estimado:** 15 minutos  
**Custo:** Grátis (Vercel + Railway com créditos)

Pronto para deploy! 🚀
