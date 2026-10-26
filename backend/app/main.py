from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run

app = FastAPI(
    title="Weather Dashboard Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health", tags=["Health Check"])
def health_check():
    return ({"status":"healthy"})


if __name__ == "__main__":
    run("main:app", port=8080, reload=True)
