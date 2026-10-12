from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/apihealth", response_model=dict)
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}
