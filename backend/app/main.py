import os
import sys
from pathlib import Path

# Ensure app directory is on sys.path regardless of execution context
app_dir = str(Path(__file__).resolve().parent)
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

# Automatic .env file loader without external dependencies
def load_dotenv_files():
    search_paths = [
        Path.cwd() / ".env",
        Path.cwd() / ".env.local",
        Path(__file__).resolve().parent / ".env",
        Path(__file__).resolve().parent.parent / ".env",
        Path(__file__).resolve().parent.parent / ".env.local",
        Path(__file__).resolve().parent.parent.parent / ".env",
        Path(__file__).resolve().parent.parent.parent / ".env.local",
    ]
    for env_path in search_paths:
        if env_path.is_file():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
            except Exception:
                pass

load_dotenv_files()

try:
    from app.api.routes import router
except ModuleNotFoundError:
    from api.routes import router

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run

app = FastAPI(
    title="Wind Dashboard Backend",
    version="1.0.0",
)

# Read origins from CORS_ORIGINS and FRONTEND_URL
cors_origins_env = os.getenv("CORS_ORIGINS", "")
frontend_url_env = os.getenv("FRONTEND_URL", "")

allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
if frontend_url_env and frontend_url_env.strip() not in allowed_origins:
    allowed_origins.append(frontend_url_env.strip())

# Default local development origins
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
for d_origin in default_origins:
    if d_origin not in allowed_origins:
        allowed_origins.append(d_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy"}

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    host = os.getenv("HOST", "0.0.0.0")
    run("main:app", host=host, port=port, reload=True)
