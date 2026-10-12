import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from backend folder or current working directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import health, models, chat, playground, swarm

app = FastAPI(
    title="EVILCLOWN AI — NVIDIA NIM Backend",
    description="Autonomous Multi-Agent AI Swarm & High-Performance Inference APIs",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api and root
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(models.router, prefix="/api", tags=["Models"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(playground.router, prefix="/api", tags=["Playground"])
app.include_router(swarm.router, prefix="/api", tags=["Swarm"])

# Also mount health directly at root /health for convenience
app.include_router(health.router, tags=["Root Health"])

@app.get("/")
async def root():
    return {
        "name": "EVILCLOWN AI API",
        "status": "active",
        "docs": "/docs",
        "has_nvidia_key": bool(os.getenv("NVIDIA_API_KEY"))
    }
