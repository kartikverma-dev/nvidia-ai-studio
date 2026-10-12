import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
FALLBACK_MODEL = "meta/llama-3.2-11b-vision-instruct"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = FALLBACK_MODEL
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    max_tokens: Optional[int] = 2048
    stream: Optional[bool] = True

@router.post("/chat")
async def chat_completions(req: ChatRequest):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream" if req.stream else "application/json"
    }

    selected_model = req.model or FALLBACK_MODEL

    payload = {
        "model": selected_model,
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
                    # Initial attempt
                    response = await client.post(
                        f"{NVIDIA_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    )

                    if response.status_code in [404, 410] and selected_model != FALLBACK_MODEL:
                        notice_text = f"> *[Notice: `{selected_model}` is currently offline/deprecated on NVIDIA NIM. Automatically routed to verified engine `{FALLBACK_MODEL}`]*\n\n"
                        yield f"data: {json.dumps({'content': notice_text})}\n\n"
                        payload["model"] = FALLBACK_MODEL
                        response = await client.post(
                            f"{NVIDIA_BASE_URL}/chat/completions",
                            headers=headers,
                            json=payload
                        )

                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': f'NVIDIA API Error {response.status_code}: {response.text[:250]}'})}\n\n"
                        yield "data: [DONE]\n\n"
                        return

                    # Parse streaming body lines
                    for line in response.text.split("\n"):
                        line = line.strip()
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
                yield "data: [DONE]\n\n"

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
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                f"{NVIDIA_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            if res.status_code in [404, 410] and selected_model != FALLBACK_MODEL:
                payload["model"] = FALLBACK_MODEL
                res = await client.post(
                    f"{NVIDIA_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return res.json()
