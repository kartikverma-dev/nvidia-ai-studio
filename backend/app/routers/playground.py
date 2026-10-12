import os
import time
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

class PlaygroundMessage(BaseModel):
    role: str
    content: str

class PlaygroundRequest(BaseModel):
    model: str = "meta/llama-3.1-70b-instruct"
    system_prompt: Optional[str] = "You are an elite AI engineer."
    user_prompt: str
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95
    max_tokens: Optional[int] = 1024
    presence_penalty: Optional[float] = 0.0
    frequency_penalty: Optional[float] = 0.0

@router.post("/playground")
async def run_playground(req: PlaygroundRequest):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY is not configured.")

    messages = []
    if req.system_prompt:
        messages.append({"role": "system", "content": req.system_prompt})
    messages.append({"role": "user", "content": req.user_prompt})

    payload = {
        "model": req.model,
        "messages": messages,
        "temperature": req.temperature,
        "top_p": req.top_p,
        "max_tokens": req.max_tokens,
        "stream": False
    }

    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{NVIDIA_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            latency_ms = int((time.time() - start_time) * 1000)

            if resp.status_code != 200:
                return {
                    "success": False,
                    "error": resp.text,
                    "latency_ms": latency_ms,
                    "status_code": resp.status_code
                }

            data = resp.json()
            choices = data.get("choices", [])
            output_text = choices[0].get("message", {}).get("content", "") if choices else ""
            usage = data.get("usage", {})

            return {
                "success": True,
                "output": output_text,
                "latency_ms": latency_ms,
                "tokens": {
                    "prompt_tokens": usage.get("prompt_tokens", len(req.user_prompt) // 4),
                    "completion_tokens": usage.get("completion_tokens", len(output_text) // 4),
                    "total_tokens": usage.get("total_tokens", (len(req.user_prompt) + len(output_text)) // 4)
                },
                "model": req.model,
                "finish_reason": choices[0].get("finish_reason") if choices else "completed"
            }
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        return {
            "success": False,
            "error": str(e),
            "latency_ms": latency_ms
        }
