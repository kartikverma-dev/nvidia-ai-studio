import os
import json
import asyncio
import time
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

class SwarmAgentConfig(BaseModel):
    id: str
    name: str
    role: str
    system_prompt: str

class SwarmRunRequest(BaseModel):
    objective: str
    model: Optional[str] = "meta/llama-3.2-11b-vision-instruct"
    mode: Optional[str] = "sequential"  # sequential, parallel, or hierarchical
    temperature: Optional[float] = 0.6
    concurrency_limit: Optional[int] = 3

DEFAULT_AGENTS = [
    {
        "id": "agent-planner",
        "name": "System Architect",
        "role": "Planner & Requirements Decomposition",
        "system_prompt": "You are the Lead System Architect in an autonomous AI Swarm. Analyze the user's objective, identify core architectural constraints, component breakdown, and step-by-step strategy. Provide structured, concise planning bullet points."
    },
    {
        "id": "agent-engineer",
        "name": "Core Engineer",
        "role": "Implementation & Technical Depth",
        "system_prompt": "You are the Senior Implementation Specialist in an autonomous AI Swarm. Based on the system architecture and user goal, produce complete, high-quality, production-grade technical solution details, code structures, or algorithms."
    },
    {
        "id": "agent-auditor",
        "name": "Security & QA Auditor",
        "role": "Vulnerability Analysis & Resilience",
        "system_prompt": "You are the Principal Security & Reliability Auditor in an autonomous AI Swarm. Critique the plan and implementation, detect edge-case failures, security risks, scalability limits, and specify defensive mitigations."
    },
    {
        "id": "agent-synthesizer",
        "name": "Swarm Synthesizer",
        "role": "Executive Synthesis & Master Deliverable",
        "system_prompt": "You are the Swarm Lead Synthesizer. Merge the Architect plan, Core Implementation, and Security critique into a coherent, executive-ready master deliverable. Highlight key takeaways, architecture, code, and deployment recommendations."
    }
]

async def query_nvidia_llm(client: httpx.AsyncClient, api_key: str, model: str, system_prompt: str, user_content: str, temp: float = 0.6) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": temp,
        "max_tokens": 1500,
        "stream": False
    }
    resp = await client.post(
        f"{NVIDIA_BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    if resp.status_code == 200:
        data = resp.json()
        choices = data.get("choices", [])
        return choices[0].get("message", {}).get("content", "") if choices else "No response generated."
    else:
        return f"[Error from NVIDIA API: HTTP {resp.status_code} - {resp.text[:200]}]"

@router.get("/swarm/agents")
async def get_default_agents():
    return {"agents": DEFAULT_AGENTS}

@router.post("/swarm/run")
async def run_swarm(req: SwarmRunRequest):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY is not configured.")

    async def swarm_stream():
        agents = DEFAULT_AGENTS
        yield f"data: {json.dumps({'event': 'swarm_initialized', 'total_agents': len(agents), 'objective': req.objective, 'model': req.model})}\n\n"
        await asyncio.sleep(0.1)

        client = httpx.AsyncClient(timeout=90.0)
        accumulated_context = f"Objective: {req.objective}\n\n"

        try:
            for idx, agent in enumerate(agents):
                agent_id = agent["id"]
                agent_name = agent["name"]
                
                # Signal agent started
                yield f"data: {json.dumps({'event': 'agent_started', 'agent_id': agent_id, 'name': agent_name, 'role': agent['role'], 'step': idx + 1})}\n\n"
                start_t = time.time()

                # Call actual NVIDIA LLM
                user_prompt = f"Objective:\n{req.objective}\n\nContext so far:\n{accumulated_context}"
                agent_result = await query_nvidia_llm(
                    client=client,
                    api_key=api_key,
                    model=req.model or "meta/llama-3.1-70b-instruct",
                    system_prompt=agent["system_prompt"],
                    user_content=user_prompt,
                    temp=req.temperature or 0.6
                )
                duration_ms = int((time.time() - start_t) * 1000)

                # Accumulate for next agents
                accumulated_context += f"--- [{agent_name} Report] ---\n{agent_result}\n\n"

                # Signal agent finished
                yield f"data: {json.dumps({'event': 'agent_completed', 'agent_id': agent_id, 'name': agent_name, 'output': agent_result, 'duration_ms': duration_ms, 'step': idx + 1})}\n\n"
                await asyncio.sleep(0.1)

            # Signal final completion
            yield f"data: {json.dumps({'event': 'swarm_finished', 'synthesis': accumulated_context, 'status': 'success'})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'event': 'swarm_error', 'error': str(e)})}\n\n"
        finally:
            await client.aclose()

    return StreamingResponse(
        swarm_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
