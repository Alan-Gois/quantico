# Quantico v2.0.0 — Quantum Protocol Simulator

Professional quantum key distribution protocol simulator with step-by-step calculation tracking for BB84 and MDI-QKD protocols. Built with Python backend and React frontend.

## Production Deployment

Quantico is now deployed in production and ready for use:

- **Frontend:** https://quantico-frontend.vercel.app
- **Backend API:** https://quantico-backend.railway.app
- **API Documentation:** https://quantico-backend.railway.app/docs

Visit the frontend URL to start simulating quantum protocols.

## Features

- BB84 Quantum Key Distribution protocol simulation
- MDI-QKD (Measurement-Device-Independent) protocol simulation
- Step-by-step calculation tracking with 7 detailed steps per simulation
- Real-time parameter adjustment with interactive sliders
- Formula visualization at each calculation step
- Responsive dashboard with key metrics
- Full REST API with OpenAPI/Swagger documentation
- Production-ready containerization with Docker
- 137 automated tests (71 backend, 66 frontend)

## Quick Start

### Using the Web Interface

1. Visit https://quantico-frontend.vercel.app
2. Select protocol (BB84 or MDI-QKD) from dropdown
3. Adjust parameters using interactive sliders
4. Click "Run Simulation"
5. View 7 calculation steps with formulas and intermediate results
6. Review final metrics on dashboard

### Using the API

```bash
# BB84 Step-by-Step Simulation
curl -X POST https://quantico-backend.railway.app/simulate/bb84/stepbystep \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 10,
    "fiber_loss_db_km": 0.22,
    "detector_efficiency": 0.8,
    "dark_count_rate": 0.00001
  }'

# MDI-QKD Step-by-Step Simulation
curl -X POST https://quantico-backend.railway.app/simulate/mdi-qkd/stepbystep \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 20,
    "fiber_loss_db_km": 0.22,
    "detection_efficiency": 0.8,
    "quantum_bit_error_rate": 0.1
  }'

# Health Check
curl https://quantico-backend.railway.app/health
```

## Local Development

### Backend Setup

```bash
cd C:\Projetos\Quantico
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.api.main:app --reload
```

The API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
Quantico/
├── backend/
│   ├── api/                          # FastAPI endpoints
│   ├── calculations/
│   │   ├── quantum_protocols.py       # Basic simulators
│   │   └── quantum_protocols_stepbystep.py  # Step-by-step engines
│   ├── models/                       # Pydantic data models
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── hooks/                    # Custom React hooks
│   │   └── types/                    # TypeScript definitions
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
├── tests/
│   ├── test_api_stepbystep.py        # Backend API tests
│   ├── test_stepbystep.py            # Calculator tests
│   └── frontend/src                  # Component tests
├── docker-compose.yml
├── requirements.txt
├── vercel.json                       # Vercel configuration
├── railway.json                      # Railway configuration
└── PRODUCTION_DEPLOYMENT.md          # Deployment guide
```

## Technology Stack

### Backend
- Python 3.11
- FastAPI for REST API
- Pydantic for data validation
- NumPy/SciPy for numerical computation
- Uvicorn ASGI server
- Docker containerization

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication
- Jest for testing

## Testing

The project includes comprehensive test coverage:

- 71 backend tests (quantum calculations and API endpoints)
- 66 frontend tests (React components and hooks)
- All tests passing with 100% success rate

Run tests locally:

```bash
# Backend tests
python -m pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

## Deployment

Quantico is deployed on:
- **Vercel** for frontend (automatic CDN, global distribution)
- **Railway** for backend (containerized, auto-scaling)

For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

## API Endpoints

### Simulation Endpoints

- `POST /simulate/bb84/stepbystep` - BB84 step-by-step simulation
- `POST /simulate/mdi-qkd/stepbystep` - MDI-QKD step-by-step simulation
- `POST /sweep/bb84/stepbystep` - BB84 distance sweep with steps
- `POST /sweep/mdi-qkd/stepbystep` - MDI-QKD distance sweep with steps

### Status Endpoints

- `GET /health` - API health check
- `GET /docs` - OpenAPI/Swagger documentation

## Performance

Production performance metrics:
- Frontend response time: <500ms (global CDN)
- Backend health check: <100ms
- API response time: <1000ms
- Frontend bundle size: 602KB (gzipped: 169KB)

## Documentation

- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Complete deployment guide
- [TESTING.md](TESTING.md) - Testing documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CLAUDE.md](CLAUDE.md) - Development guidelines

## Version History

### v2.0.0 (Current)
- Complete step-by-step calculation interface
- React frontend with 5 reusable components
- Backend calculation engine with 7-step breakdown
- Production deployment on Vercel and Railway
- 137 comprehensive tests
- Full Docker containerization
- TypeScript support across codebase

## Team

Developed by: Claude Haiku 4.5
Framework: Claude Agent Ecosystem (E.D.I.T.H., J.A.R.V.I.S., F.R.I.D.A.Y.)

## License

Project in active development. Contact for licensing information.

## Support

For issues or questions:
1. Check the [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) troubleshooting section
2. Review API documentation at https://quantico-backend.railway.app/docs
3. Check GitHub issues and project documentation
