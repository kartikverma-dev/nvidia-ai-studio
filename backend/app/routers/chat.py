import os
import json
import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "meta/llama-3.1-70b-instruct"
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    max_tokens: Optional[int] = 2048
    stream: Optional[bool] = True

@router.post("/chat")
async def chat_completions(req: ChatRequest):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY is not configured in backend.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream" if req.stream else "application/json"
    }

    payload = {
        "model": req.model,
        "messages": [{"role": m.role, "content": m.content} for m in req.messages],
        "temperature": req.temperature,
        "top_p": req.top_p,
        "max_tokens": req.max_tokens,
        "stream": req.stream
    }

    if req.stream:
        async def event_generator():
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream(
                        "POST",
                        f"{NVIDIA_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    ) as response:
                        if response.status_code != 200:
                            err_content = await response.aread()
                            yield f"data: {json.dumps({'error': f'Upstream error {response.status_code}: {err_content.decode()}'})}\n\n"
                            return

                        async for line in response.aiter_lines():
                            if not line:
                                continue
                            if line.startswith("data: "):
                                data_str = line[6:].strip()
                                if data_str == "[DONE]":
                                    yield "data: [DONE]\n\n"
                                    break
                                try:
                                    parsed = json.loads(data_str)
                                    choices = parsed.get("choices", [])
                                    if choices:
                                        delta = choices[0].get("delta", {})
                                        content = delta.get("content", "")
                                        if content:
                                            yield f"data: {json.dumps({'content': content})}\n\n"
                                except Exception:
                                    pass
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )
    else:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{NVIDIA_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                if res.status_code != 200:
                    raise HTTPException(status_code=res.status_code, detail=res.text)
                return res.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"NVIDIA API communication error: {str(e)}")
