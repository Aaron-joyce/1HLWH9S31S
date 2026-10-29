# Streamlined Video Script (Target: Under 8 Minutes Total)
**UK Wind Generation & Forecast Dashboard (January 2026)**

---

## ⏱️ Video Overview & Timing Budget

- **Target Total Runtime:** ~7 to 8 minutes (Safely below the 10:00 hard maximum).
- **Part 1 (Client Presentation):** ~3.5 minutes.
- **Part 2 (Technical Review):** ~3.5 minutes.
- **Format:** Single take via OBS (screen share + webcam PIP). Each paragraph is formatted on a single line.

---

## PART 1: CLIENT PRESENTATION (~3.5 minutes)

Hi everyone. Every day, your desk has to buy electricity on the wholesale market for the following day. Wind power is clean and low-cost, but because it is weather-dependent, you have to decide 24 hours in advance how much thermal backup power, like gas, you need to buy. If the wind forecast is too optimistic, you under-procure backup power and get hit with expensive balancing penalties. If the forecast is too pessimistic, you over-buy gas and waste money.

Today I'm here to address this major issue that you face. The wind generation dashboard we built for you solves exactly that issue by showing you the latest wind forecasts alongside a quantified error margin, so your team knows exactly how much safety buffer to plan for. Let's look at the numbers for January 2026.

Across the top are your four key operational figures:

First, Forecast Error shows a Root Mean Square Error of 2,395 megawatts, with an accuracy rate of 83.4% and an average error of 1,818 megawatts. This Root Mean Square Error is the most important number on screen: it tells you that day-ahead forecasts were typically off by about 2,400 megawatts, giving you a clear benchmark for sizing your thermal backup reserve.

Second, Mean Bias Error shows plus 1,713 megawatts with an Over-Forecast indicator. This is vital because it reveals directional bias: the weather models didn't just have random error, they systematically over-predicted wind by an average of 1,700 megawatts per interval across January.

Third, Normalized Root Mean Square Error scales that model loss against Great Britain's total 30 gigawatt wind fleet capacity, coming out to 8.0%. This comfortably beats the industry standard benchmark of 8.5%, confirming the model is solid overall despite the winter volatility.

Fourth, Net Energy Variance shows a cumulative deficit of 637.4 gigawatt-hours across January. Total delivered wind was 4,308 gigawatt-hours against a forecast target of 4,945 gigawatt-hours, confirming that persistent over-forecasting created a real energy shortfall that required calling on backup thermal generation.

Let's come to the most important part of the dashboard.

This is the main chart, where we track all 1,488 half-hour settlement periods in January in UK grid time in Coordinated Universal Time. The blue line is actual metered generation from Elexon, the red dashed line is the day-ahead forecast, and the green line is variance. For example, on Wednesday January 28th at 21:30, actual wind dropped to 4,992 megawatts while the forecast expected 6,468 megawatts, creating a 1,476 megawatt shortfall in that single half hour. You can toggle lines off or hover over any interval to inspect specific trading periods.

Beside it is the pie chart which tells whether there was an over or under forecast and by how much—over 66% of intervals had severe over-forecasting greater than 1,000 megawatts, proving how frequent that shortfall was.

Below, the Cumulative Energy Tracker and the 24-hour Diurnal Profile confirm this trend: the red forecast line consistently exceeded actual generation across all 24 hours of the day. Knowing this systematic bias allows your trading desk to adjust forecasts downward and avoid under-hedging.

In short, this dashboard replaces guesswork with quantified data, helping your team size thermal backup contracts with confidence and protect your wholesale margins.

---

## PART 2: TECHNICAL REVIEW (~3.5 minutes)
Audience: Internal Tech Lead  
Goal: Concise walkthrough of architecture, Elexon data fixes, tests, and Docker.

[3:00 - 3:45] Architecture & Stack  
*Screen: Switch to VS Code showing directory tree.*

Hi. For the technical review, I'll walk through the application architecture, how we resolved Elexon data quirks, test coverage, and deployment. The stack is clean and decoupled: a Python 3.14 backend using FastAPI for asynchronous Application Programming Interface endpoints and Pydantic for strict data contracts, with Pandas and NumPy handling time-series calculations. The frontend is built with React 19, TypeScript, Vite, Tailwind CSS, and Recharts. The entire system is containerized with Docker and Docker Compose for easy local and cloud execution.

[3:45 - 4:50] Data Pipeline & Leakage Prevention  
*Screen: Open backend/app/services/elexon.py (lines 20–65).*

The core business logic is in backend/app/services/elexon.py. We ingest two official Elexon Balancing Mechanism Reporting Service streams: FUELHH filtered for fuel type equals WIND to get actuals, and WINDFOR for forecasts. Raw Elexon data has two critical pitfalls that we resolved: first, lookahead bias. The raw stream contains forecasts published after the settlement interval started. To ensure we only evaluate forecasts genuinely available at decision time, we strictly filter publish time less than start time. Second, delivery window clamping. The stream returns dates outside January, so we strictly bound delivery between January 1st and January 31st, 2026. This guarantees exactly 1,488 half-hour settlement periods. For each period, we select the latest pre-gate forecast, merge on start time, and compute the full suite of vectorized metrics in Pandas: Root Mean Square Error, Mean Absolute Error, Mean Bias Error to track directional over-forecasting drift, and Normalized Root Mean Square Error scaled against the 30 gigawatt Great Britain fleet capacity. We compute dedicated breakdowns for both Day-Ahead and Intraday horizons, validated directly by our Pydantic schema.

[4:50 - 5:40] Frontend Resiliency & UTC Handling  
*Screen: Open frontend/src/hooks/useWindData.ts and show src/lib/utils.ts.*

On the frontend, state and fetching live in the custom hook useWindData.ts. The frontend synchronizes with the backend response contract to consume these server-side metrics, while also providing a client-side computeAnalytics engine so that date filtering and horizon toggles recompute metrics instantly in the browser without redundant server requests. It also includes automatic retry logic with backoff for network resilience. In src/lib/utils.ts, all date-time formatters explicitly enforce Coordinated Universal Time, which is vital because National Grid Electricity System Operator settlement periods are strictly tracked in Coordinated Universal Time.

[5:40 - 6:30] Testing, Docker & Wrap-Up  
*Screen: Open terminal in VS Code, run `uv run pytest`, then show README.md.*

For quality assurance, backend unit tests in tests/test_elexon.py verify ex-post forecast exclusion, boundary clamping to 1,488 periods, mathematical Root Mean Square Error accuracy, and metric validations across Day-Ahead and Intraday horizons. Running uv run pytest shows all 4 tests passing in under one second. For containerization, we provide a lean backend Dockerfile using uv, a multi-stage frontend Dockerfile with Nginx, and a root docker-compose.yml that spins up both services with a single command. The application is deployed live with backend on Render and frontend on Vercel. In accordance with guidelines, the repo has an anonymous name, full setup documentation, and explicit disclosure of Artificial Intelligence tool usage for scaffolding and typing. That completes the review, thank you!
