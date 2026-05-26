# Benchlink — Agentic Supply Chain Platform

Benchlink is an AI-powered supply chain platform that helps hardware companies source suppliers, discover buyers, coordinate logistics, and generate bilingual RFQs — all through a natural-language agentic interface.

## Architecture

```
benchlink/
├── backend/           FastAPI + SQLAlchemy (async) + DeepSeek AI
│   ├── app/
│   │   ├── agent/     ReAct agent engine, LLM client, tools
│   │   ├── api/       REST endpoints
│   │   ├── db/        Database models, session, seeds
│   │   ├── models/    SQLAlchemy ORM models
│   │   ├── schemas/   Pydantic request/response schemas
│   │   └── services/  Business logic layer
│   └── tests/
├── src/               React 18 + Vite frontend
│   ├── App.jsx        Single-page app (dashboard, sourcing, buyers, logistics)
│   ├── hooks/         Custom React hooks (useTheme)
│   └── styles/        CSS design tokens + component styles
├── docker-compose.yml
└── index.html
```

## Quick Start

### Prerequisites

- **Python** >= 3.12
- **Node.js** >= 18
- A [DeepSeek API key](https://platform.deepseek.com/)

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.template .env
# Edit .env — set your DEEPSEEK_API_KEY

# Run
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The API is available at `http://localhost:8001`. Interactive docs at `/docs`.

### 2. Frontend

```bash
# From the project root
npm install
npm run dev
```

The app is available at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend on port 8001.

### 3. Docker (both services)

```bash
docker compose up --build
```

## Features

### Dashboard
KPIs for active sourcing requests, buyer leads, and pending shipments. Activity feed and sourcing trend chart.

### Supplier Sourcing
Agentic AI chatbox — describe your product and the ReAct agent analyzes components, searches suppliers, and returns ranked matches with match scores, lead times, and pricing. Hierarchical location filtering (country → state → city) and component-based filtering.

### Buyer Discovery
Kanban board tracking buyer leads through stages (Identified → Contacted → Engaged → Relationship). AI-powered lead discovery by product description. Fit score analysis with product, market, budget, and timeline dimensions.

### Logistics Coordination
Multi-carrier shipping quote calculator with urgency levels (express/standard/economy). Origin/destination routing with volumetric weight support. Active shipment tracking with multi-stage FedEx-style progress timelines and CO2 estimates.

### RFQ Generation
Bilingual (English + Chinese) request-for-quotation documents auto-generated from selected suppliers.

## API Endpoints

| Prefix | Description |
|---|---|
| `GET /api/v1/health` | Health check |
| `GET /api/v1/suppliers` | List/search suppliers (supports `component`, `country`, `state`, `city`, `sort_by`) |
| `POST /api/v1/sourcing/sessions` | Create sourcing session |
| `POST /api/v1/sourcing/sessions/{id}/messages` | Send message to AI agent |
| `POST /api/v1/sourcing/sessions/{id}/upload` | Upload BOM file for analysis |
| `POST /api/v1/sourcing/sessions/{id}/rfq` | Generate bilingual RFQ |
| `GET /api/v1/buyers` | List buyers |
| `POST /api/v1/buyers/discover` | AI buyer discovery |
| `PATCH /api/v1/buyers/{id}` | Update buyer stage/notes |
| `POST /api/v1/logistics/quotes` | Get shipping quotes |
| `GET /api/v1/logistics/shipments` | List shipments |
| `GET /api/v1/logistics/shipments/{id}/track` | Track shipment progress |
| `GET /api/v1/locations` | List all locations |
| `GET /api/v1/locations/countries` | List countries |
| `GET /api/v1/locations/{country}/states` | List states |
| `GET /api/v1/locations/{country}/{state}/cities` | List cities |
| `GET /api/v1/activity` | Activity feed |
| `GET /api/v1/dashboard/kpis` | Dashboard KPIs |

Full interactive docs at `http://localhost:8001/docs`.

## Testing

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

## Configuration

Backend configuration is in `backend/.env` (copy from `.env.template`):

| Variable | Description |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API key (required) |
| `DEEPSEEK_BASE_URL` | API base URL (default: `https://api.deepseek.com/v1`) |
| `DEEPSEEK_MODEL` | Model name (default: `deepseek-chat`) |
| `DATABASE_URL` | SQLAlchemy DB URL (default: SQLite) |
| `AGENT_MAX_ITERATIONS` | Max ReAct loop iterations (default: 10) |
| `CORS_ORIGINS` | Allowed CORS origins |

## Tech Stack

- **Frontend**: React 18, Vite 6, Recharts, Lucide React
- **Backend**: FastAPI, SQLAlchemy 2 (async), Pydantic v2
- **AI**: DeepSeek API (OpenAI-compatible) with ReAct agent pattern
- **Database**: SQLite (dev), PostgreSQL-compatible via SQLAlchemy
- **Deploy**: Docker Compose
