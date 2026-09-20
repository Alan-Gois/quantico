# Docker — Quantico

Guia completo para rodar o projeto com Docker.

## Pré-requisitos

- Docker Desktop instalado
- Docker Compose (geralmente incluído com Docker Desktop)

## Quick Start

### Build e Run

```bash
cd C:\Projetos\Quantico

# Build das imagens
docker-compose build

# Rodar os containers
docker-compose up -d
```

### Acessar

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Parar

```bash
docker-compose down
```

## Modo Desenvolvimento

Com volumes montados, você pode editar o código e os containers recarregam automaticamente:

```bash
docker-compose up -d
```

Edite os arquivos:
- `backend/api/main.py`
- `backend/calculations/quantum_protocols.py`
- `frontend/src/components/*.tsx`

Os containers recarregam automaticamente.

## Logs

Ver logs do backend:
```bash
docker-compose logs -f backend
```

Ver logs do frontend:
```bash
docker-compose logs -f frontend
```

Ver todos:
```bash
docker-compose logs -f
```

## Build sem Cache

```bash
docker-compose build --no-cache
```

## Limpar Tudo

```bash
# Para containers
docker-compose down

# Remove images
docker-compose down --rmi all

# Remove volumes
docker-compose down -v
```

## Estrutura Docker

```
backend/
├── Dockerfile           # Python 3.11 slim
├── requirements.txt
└── api/main.py

frontend/
├── Dockerfile           # Node 20 alpine + serve
├── package.json
└── src/

docker-compose.yml      # Orquestração
.dockerignore          # Otimização
```

## Portas

- Backend: `8000` (http://localhost:8000)
- Frontend: `3000` (http://localhost:3000)

## Variáveis de Ambiente

### Backend
- `PYTHONUNBUFFERED=1` — Não bufera stdout

### Frontend
- `VITE_API_URL=http://localhost:8000` — URL da API

## Health Check

Backend possui health check automático:
```bash
curl http://localhost:8000/health
```

Resposta esperada: `{"status": "ok", "timestamp": "..."}`

## Troubleshooting

### Porta já em uso
```bash
# Mude a porta no docker-compose.yml
ports:
  - "8001:8000"  # Novo: 8001
```

### Container não inicia
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild necessário
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Production

Para produção, remova os volumes de desenvolvimento no `docker-compose.yml`:

```yaml
services:
  backend:
    volumes:
      # Remova estas linhas para produção
      - ./backend:/app/backend
      - ./config:/app/config
```

E sempre use uma tag de versão:
```bash
docker build -t quantico-backend:1.0.0 -f backend/Dockerfile .
```
