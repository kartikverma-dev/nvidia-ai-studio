import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

DEFAULT_FEATURED_MODELS = [
    {
        "id": "meta/llama-3.1-70b-instruct",
        "name": "Llama 3.1 70B Instruct",
        "owner": "Meta",
        "category": "Chat & Reasoning",
        "context_window": 128000,
        "is_default": True
    },
    {
        "id": "meta/llama-3.1-8b-instruct",
        "name": "Llama 3.1 8B Instruct",
        "owner": "Meta",
        "category": "Fast & Lightweight",
        "context_window": 128000
    },
    {
        "id": "mistralai/mixtral-8x22b-instruct-v0.1",
        "name": "Mixtral 8x22B Instruct",
        "owner": "Mistral AI",
        "category": "General Intelligence",
        "context_window": 64000
    },
    {
        "id": "deepseek-ai/deepseek-coder-6.7b-instruct",
        "name": "DeepSeek Coder 6.7B",
        "owner": "DeepSeek",
        "category": "Code Specialist",
        "context_window": 16000
    },
    {
        "id": "nvidia/nemotron-4-340b-instruct",
        "name": "Nemotron 4 340B Instruct",
        "owner": "NVIDIA",
        "category": "Flagship Enterprise",
        "context_window": 4096
    }
]

@router.get("/models")
async def get_models():
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return {"data": DEFAULT_FEATURED_MODELS, "source": "offline_defaults", "has_key": False}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{NVIDIA_BASE_URL}/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            if resp.status_code == 200:
                raw_models = resp.json().get("data", [])
                formatted = []
                for m in raw_models:
                    model_id = m.get("id", "")
                    owner = model_id.split("/")[0] if "/" in model_id else "NVIDIA"
                    name = model_id.split("/")[-1].replace("-", " ").title() if "/" in model_id else model_id
                    
                    cat = "General"
                    if "code" in model_id.lower():
                        cat = "Code"
                    elif "vision" in model_id.lower() or "fuyu" in model_id.lower():
                        cat = "Vision"
                    elif "llama" in model_id.lower() or "mixtral" in model_id.lower():
                        cat = "LLM"

                    formatted.append({
                        "id": model_id,
                        "name": name,
                        "owner": owner,
                        "category": cat,
                        "created": m.get("created"),
                        "is_default": model_id == "meta/llama-3.1-70b-instruct"
                    })
                
                # Sort: featured first
                return {"data": formatted if formatted else DEFAULT_FEATURED_MODELS, "source": "nvidia_nim_api", "has_key": True}
            else:
                return {"data": DEFAULT_FEATURED_MODELS, "source": "fallback_on_error", "error": resp.text, "has_key": True}
    except Exception as e:
        return {"data": DEFAULT_FEATURED_MODELS, "source": "fallback_exception", "error": str(e), "has_key": True}
