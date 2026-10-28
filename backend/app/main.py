import os
import sys
from pathlib import Path

# Ensure app directory is on sys.path regardless of execution context
app_dir = str(Path(__file__).resolve().parent)
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

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

cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

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
    run("main:app", port=8080, reload=True)
