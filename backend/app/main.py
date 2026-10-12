from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, models, chat, playground, swarm

app = FastAPI(title="NVIDIA AI Studio Backend")

# CORS configuration (allow all for now, adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(models.router)
app.include_router(chat.router)
app.include_router(playground.router)
app.include_router(swarm.router)
