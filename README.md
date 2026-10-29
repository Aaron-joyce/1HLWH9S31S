# UK Wind Power Generation & Forecast Dashboard

A web dashboard built for a UK energy utility team participating in the day-ahead wholesale electricity market. 

When buying electricity for the next day, the procurement team needs to estimate how much wind power will be available so they know how much backup thermal (gas/coal) generation to purchase. This application brings together official UK national grid actuals and forecasts for **January 2026**, visualizes them on 30-minute settlement intervals, and quantifies forecast accuracy to help traders avoid expensive over-procurement.

---

## Live Links

- **Live Application:** https://wind-dashboard-frontend.vercel.app/

---

## What the Dashboard Does

1. **Compare Forecasts vs. Actuals**  
   Plots actual metered wind output against day-ahead scheduled forecasts across 30-minute settlement periods. Interactive toggles allow focusing on actual generation, forecast generation, or the variance (difference).

2. **Quantified Forecast Accuracy (RMSE & MAE)**  
   Calculates Root Mean Square Error (RMSE) and Mean Absolute Error (MAE) server-side and client-side so dispatchers understand the typical error margin in Megawatts (MW).

3. **Forecast Error Distribution**  
   Groups half-hour intervals into clear operational risk buckets:
   - Severe under-forecast (>1000 MW deficit)
   - Moderate under-forecast (200–1000 MW deficit)
   - On-target (within ±200 MW)
   - Over-forecast (excess wind generation)

4. **24-Hour Average Profile**  
   Averaged hourly generation across the day to spot morning or evening ramp-up forecasting patterns.

5. **Date Filtering & CSV Export**  
   Allows drilling down into specific days or weeks in January 2026, updating all charts and metrics dynamically, and downloading the raw numbers to a CSV spreadsheet.

---

## Data Sources & Assumptions

All data comes directly from official **Elexon BMRS** stream endpoints:
- **Actuals:** `FUELHH/stream` filtered by fuel type `WIND`.
- **Forecasts:** `WINDFOR/stream` (national wind forecast stream).

### Key Rules Applied:
- **Time Window:** Strictly limited to January 2026 delivery timestamps (`2026-01-01 00:00 UTC` to `2026-01-31 23:30 UTC`), matching exactly 1,488 half-hour settlement periods.
- **Pre-Delivery Integrity:** Forecasts must be published *before* the delivery period begins (`publishTime < startTime`). Any retroactive or post-delivery updates are ignored so we only evaluate information that was genuinely available before the market closed.
- **Latest Day-Ahead Forecast:** For each settlement half-hour, the latest forecast published prior to delivery is selected.

---

## Project Structure

```text
weather-forecast-application/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup and CORS configuration
│   │   ├── api/
│   │   │   └── routes.py        # API endpoint definitions (/api/v1/wind-data)
│   │   ├── services/
│   │   │   └── elexon.py        # Data fetching from Elexon, filtering, and RMSE math
│   │   └── schema/
│   │       └── wind_data.py     # Pydantic data models for API responses
│   ├── tests/
│   │   └── test_elexon.py       # Unit tests for data merge, filtering, and RMSE
│   ├── Dockerfile               # Backend container definition
│   ├── pyproject.toml           # Python dependencies and pytest configuration
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/dashboard/
│   │   │   ├── charts/          # Line chart, volume chart, donut chart, diurnal chart
│   │   │   ├── filters/         # Date range selector
│   │   │   ├── layout/          # Page layout, header, and sidebar
│   │   │   ├── metrics/         # KPI metric summary cards
│   │   │   └── states/          # Loading skeletons and error handling states
│   │   ├── hooks/
│   │   │   ├── useWindData.ts   # Data fetching with auto-retry and metrics calculation
│   │   │   └── useDashboardFilters.ts # Date filtering state logic
│   │   ├── types/               # TypeScript interfaces
│   │   ├── lib/utils.ts         # Number and UTC date formatting helpers
│   │   ├── App.tsx              # Main dashboard view
│   │   └── main.tsx             # React DOM entry point
│   ├── Dockerfile               # Frontend container definition (Nginx)
│   ├── package.json             # Frontend dependencies
│   └── .env.example             # Frontend environment template
├── docker-compose.yml           # Runs frontend and backend together with one command
├── .env.example                 # Root environment template
└── README.md                    # Project documentation
```

---

## How to Run the Application

### Option A: Using Docker (Recommended)

Make sure Docker is running on your machine, then run:

```bash
docker compose up --build
```

- **Frontend:** Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API:** Accessible at [http://localhost:8080/api/v1/wind-data](http://localhost:8080/api/v1/wind-data).
- **Health Check:** [http://localhost:8080/health](http://localhost:8080/health).

To stop the containers:
```bash
docker compose down
```

---

### Option B: Running Locally Without Docker

#### 1. Backend Setup (Python)
You need Python 3.12+ (or [uv](https://docs.astral.sh/uv/)):

```bash
cd backend

# Install dependencies using uv
uv sync

# Run the backend server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```
The backend will be running at [http://localhost:8080](http://localhost:8080).

#### 2. Frontend Setup (Node.js)
You need Node.js 20+:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at [http://localhost:5173](http://localhost:5173).

---

## Running Automated Tests

Backend unit tests verify that the Elexon data processor properly aligns time intervals, filters out retroactive records, and calculates accurate RMSE:

```bash
cd backend
uv run pytest
```

---

## Environment Variables

| Variable | Location | Description | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | Port the backend listens on | `8080` |
| `CORS_ORIGINS` | Backend | Comma-separated list of allowed frontend URLs | `http://localhost:3000,http://localhost:5173` |
| `FRONTEND_URL` | Backend | Specific deployed frontend URL (e.g. on Vercel) | *(Optional)* |
| `VITE_API_URL` | Frontend | Target backend URL for API calls | `http://localhost:8080/api/v1/wind-data` |

---

## AI Tools Disclosure

In accordance with the challenge guidelines, AI coding assistants (including Claude and Gemini via Antigravity) were used to assist in scaffolding the project architecture, drafting unit tests, styling chart components with Tailwind CSS, and auditing data deduplication logic against the Elexon API specification. All business rules, calculations, and domain filters were verified directly against official Elexon dataset documentation.
