from api.routes import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run

app = FastAPI(
    title="Wind Dashboard Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health", tags=["Health Check"])
def health_check():
    return ({"status":"healthy"})

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    run("main:app", port=8080, reload=True)
