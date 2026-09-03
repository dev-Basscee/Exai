from fastapi import APIRouter
from app.api.workspaces import router as workspaces_router
from app.api.process import router as process_router
from app.api.predictions import router as predictions_router
from app.api.health import router as health_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(workspaces_router)
api_router.include_router(process_router)
api_router.include_router(predictions_router)

__all__ = ["api_router"]
