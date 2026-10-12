import os
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    api_key = os.getenv("NVIDIA_API_KEY", "")
    has_key = bool(api_key and len(api_key) > 5)
    return {
        "status": "online",
        "service": "EVILCLOWN AI / NVIDIA NIM Backend",
        "has_nvidia_key": has_key,
        "key_preview": f"{api_key[:8]}...{api_key[-4:]}" if has_key else None,
        "version": "1.0.0"
    }

@router.get("/apihealth")
async def legacy_health():
    return {"status": "ok"}
