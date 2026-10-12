import os
import httpx
from fastapi import APIRouter

router = APIRouter()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

# Actively verified responsive models on NVIDIA NIM
VERIFIED_MODELS = [
    {
        "id": "meta/llama-3.2-11b-vision-instruct",
        "name": "Llama 3.2 11B Vision Instruct",
        "owner": "Meta",
        "category": "Vision & General LLM",
        "status": "online",
        "is_default": True
    },
    {
        "id": "openai/gpt-oss-20b",
        "name": "GPT-OSS 20B Instruct",
        "owner": "OpenAI",
        "category": "High-Speed Reasoning",
        "status": "online",
        "is_default": False
    },
    {
        "id": "nvidia/nemotron-3-ultra-550b-a55b",
        "name": "Nemotron 3 Ultra 550B",
        "owner": "NVIDIA",
        "category": "Flagship 550B Architecture",
        "status": "online",
        "is_default": False
    },
    {
        "id": "google/diffusiongemma-26b-a4b-it",
        "name": "Diffusion Gemma 26B Instruct",
        "owner": "Google",
        "category": "Technical & Code",
        "status": "online",
        "is_default": False
    },
    {
        "id": "nvidia/nemotron-3-super-120b-a12b",
        "name": "Nemotron 3 Super 120B",
        "owner": "NVIDIA",
        "category": "Enterprise Reasoning",
        "status": "online",
        "is_default": False
    },
    {
        "id": "nvidia/nemotron-3.5-lightning-30b-a3b",
        "name": "Nemotron 3.5 Lightning 30B",
        "owner": "NVIDIA",
        "category": "Low-Latency Specialist",
        "status": "online",
        "is_default": False
    }
]

# Models known to have reached EOL (410 Gone) or 404 in late 2026
EXCLUDED_KEYWORDS = [
    "llama-3.1-70b-instruct",
    "llama-3.1-8b-instruct",
    "llama-3.2-1b",
    "llama-3.2-3b",
    "llama-3.3-70b",
    "embed",
    "rerank",
    "clip",
    "whisper",
    "parakeet",
    "reward"
]

@router.get("/models")
async def get_models():
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return {"data": VERIFIED_MODELS, "source": "verified_defaults", "has_key": False}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{NVIDIA_BASE_URL}/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            if resp.status_code == 200:
                raw_models = resp.json().get("data", [])
                
                # Verified list comes first
                known_ids = {m["id"] for m in VERIFIED_MODELS}
                combined = list(VERIFIED_MODELS)

                for m in raw_models:
                    model_id = m.get("id", "")
                    # Filter out known expired or non-chat models
                    if model_id in known_ids or any(k in model_id.lower() for k in EXCLUDED_KEYWORDS):
                        continue
                    
                    owner = model_id.split("/")[0] if "/" in model_id else "NVIDIA"
                    name = model_id.split("/")[-1].replace("-", " ").title() if "/" in model_id else model_id
                    
                    combined.append({
                        "id": model_id,
                        "name": name,
                        "owner": owner,
                        "category": "NIM Model",
                        "status": "available",
                        "is_default": False
                    })
                
                return {"data": combined, "source": "nvidia_nim_live", "has_key": True}
            else:
                return {"data": VERIFIED_MODELS, "source": "verified_defaults", "has_key": True}
    except Exception as e:
        return {"data": VERIFIED_MODELS, "source": "verified_defaults", "error": str(e), "has_key": True}
