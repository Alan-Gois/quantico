# Production Deployment Guide - Quantico v2.0.0

Complete guide for deploying Quantico to production using Vercel (frontend) and Railway (backend).

## Prerequisites

Before starting, ensure you have:
- GitHub account with admin access to alan01110011/quantico repository
- Vercel account (signup at https://vercel.com)
- Railway account (signup at https://railway.app)
- Main branch updated and pushed to origin

Current status: Main branch is up-to-date with all production code.

## Architecture Overview

```
Frontend (Vercel)
  - React + Vite + TypeScript
  - Served from CDN globally
  - Environment: VITE_API_URL
  
Backend (Railway)
  - Python FastAPI + Uvicorn
  - Containerized with Docker
  - Environment: PORT, PYTHONUNBUFFERED
```

## Step 1: Deploy Backend to Railway

### Option A: Via Railway Dashboard (Recommended)

1. Go to https://railway.app and log in
2. Click "New Project" button
3. Select "Deploy from GitHub repo"
4. Search for "alan01110011/quantico" and select it
5. Railway will auto-detect the Dockerfile in `backend/Dockerfile`
6. Configure environment variables:
   - PORT: 8000
   - PYTHONUNBUFFERED: 1
7. Click "Deploy"
8. Wait for build to complete (usually 2-3 minutes)
9. Once deployed, note the Railway domain (will look like `quantico-backend-prod.railway.app`)

### Option B: Via Railway CLI

```bash
npm install -g @railway/cli
cd C:\Projetos\Quantico
railway login
railway init
railway up
```

### Verify Backend Deployment

```bash
# Health check
curl https://quantico-backend.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2026-09-20T..."}

# Test API endpoint
curl -X POST https://quantico-backend.railway.app/simulate/bb84/stepbystep \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 10,
    "fiber_loss_db_km": 0.22,
    "detector_efficiency": 0.8,
    "dark_count_rate": 0.00001
  }'
```

## Step 2: Deploy Frontend to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and log in
2. Click "Add New..." > "Project"
3. Select "Import Git Repository"
4. Search for "alan01110011/quantico" and import
5. Configure project settings:
   - Framework: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install --prefix frontend`
6. Configure environment variables:
   - VITE_API_URL: `https://quantico-backend.railway.app` (replace with actual Railway URL)
7. Click "Deploy"
8. Wait for build to complete (usually 1-2 minutes)
9. Once deployed, note the Vercel URL (will look like `quantico-frontend.vercel.app`)

### Option B: Via Vercel CLI

```bash
npm install -g vercel
cd C:\Projetos\Quantico\frontend
vercel --prod
```

### Verify Frontend Deployment

```bash
# Test frontend loads
curl https://quantico-frontend.vercel.app

# Should return HTML content with status 200
```

## Step 3: Configure CORS

The backend already has CORS configured for production:
- Allowed origins include `https://*.vercel.app`
- Custom frontend URL can be set via `FRONTEND_URL` environment variable

If needed, update Railway environment variable:
- FRONTEND_URL: `https://quantico-frontend.vercel.app`

## Step 4: Run Smoke Tests

Execute the provided smoke test script:

### On Linux/macOS:
```bash
chmod +x smoke-tests.sh
./smoke-tests.sh https://quantico-frontend.vercel.app https://quantico-backend.railway.app
```

### On Windows PowerShell:
```powershell
# Install curl if not available:
# choco install curl -y

./smoke-tests.sh https://quantico-frontend.vercel.app https://quantico-backend.railway.app
```

Expected test results:
- Frontend Home: 200
- Health Check: 200
- BB84 Step-by-Step: 200
- MDI-QKD Step-by-Step: 200
- BB84 Sweep: 200
- MDI-QKD Sweep: 200

## Step 5: Manual Integration Test

1. Open frontend URL in browser: https://quantico-frontend.vercel.app
2. Select BB84 protocol from dropdown
3. Adjust distance parameter to 15 km
4. Click "Run Simulation"
5. Verify that 7 calculation steps appear with formulas and values
6. Verify results dashboard shows metrics
7. Switch to MDI-QKD and repeat steps 3-6

## Step 6: Configure Custom Domain (Optional)

### For Vercel:
1. In Vercel dashboard, go to project settings
2. Click "Domains" tab
3. Add custom domain (e.g., quantico.example.com)
4. Follow DNS configuration instructions

### For Railway:
1. In Railway dashboard, go to project settings
2. Add custom domain via Railway's domain feature
3. Update frontend VITE_API_URL if domain changed

## Step 7: Set Up Monitoring (Optional)

### Frontend (Vercel):
- Vercel provides built-in analytics and error tracking
- Enable "Web Analytics" in project settings

### Backend (Railway):
- Railway provides built-in logs
- Access via Railway dashboard > project > Logs tab
- Set up alerts for error rates

## Troubleshooting

### Frontend fails to build:
- Check that Node.js version is 18+ in Vercel settings
- Verify all dependencies in frontend/package.json are compatible
- Check build logs in Vercel dashboard for specific errors

### Backend fails to start:
- Verify Railway has Python 3.11 available (should be automatic)
- Check that all dependencies in requirements.txt are available
- Review Railway logs for import errors or missing modules

### CORS errors in browser console:
- Verify backend CORS configuration includes frontend domain
- Add frontend domain to Railway environment: `FRONTEND_URL=<url>`
- Restart backend service after environment change

### API endpoints return 404:
- Verify backend is fully started (check Railway logs)
- Test health endpoint first: `curl <backend-url>/health`
- Verify API routes in backend/api/main.py are correct

## Rollback Plan

If deployment has issues:

### For Frontend:
1. Go to Vercel dashboard
2. Select previous working deployment
3. Click "Promote to Production"

### For Backend:
1. Go to Railway dashboard
2. Select previous working deployment
3. Click "Redeploy"

## Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] Backend accessible at Railway URL
- [ ] Health check returns 200
- [ ] API endpoints respond correctly
- [ ] CORS configured properly
- [ ] All smoke tests pass
- [ ] Frontend loads without errors
- [ ] API calls from frontend work correctly
- [ ] Performance acceptable (response times < 1s)
- [ ] No errors in production logs
- [ ] GitHub release v2.0.0 created
- [ ] README updated with production URLs

## Production URLs

Once deployed, update these URLs in the project:

Frontend: `https://quantico-frontend.vercel.app`
Backend: `https://quantico-backend.railway.app`
API Docs: `https://quantico-backend.railway.app/docs`

## Monitoring

### Daily Checks:
- Check Railway logs for errors
- Verify response times are acceptable
- Monitor error rates

### Weekly Checks:
- Review Vercel analytics
- Check for any deployment issues
- Review backend logs for warnings

## Support

For deployment issues, check:
1. Railway documentation: https://docs.railway.app
2. Vercel documentation: https://vercel.com/docs
3. FastAPI documentation: https://fastapi.tiangolo.com
4. Vite documentation: https://vitejs.dev

---

Generated: 2026-09-20
Status: Production Ready
Version: 2.0.0
