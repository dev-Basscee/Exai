import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.config import settings
from app.models.upload import Upload

router = APIRouter(tags=["System"])


@router.get("/health")
async def healthcheck(db: AsyncSession = Depends(get_db_session)):
    """Health check endpoint verifying database connectivity and configuration."""
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "version": settings.VERSION,
        "database": db_status,
        "llm_provider": settings.LLM_PROVIDER,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "gemini_model": settings.GEMINI_MODEL,
        "anthropic_configured": bool(settings.ANTHROPIC_API_KEY),
        "storage_type": settings.STORAGE_TYPE,
    }


@router.get("/uploads/{upload_id}/download")
async def download_file(
    upload_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """Download an uploaded file by its upload ID."""
    query = select(Upload).where(Upload.id == upload_id)
    res = await db.execute(query)
    upload = res.scalar_one_or_none()

    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path = Path(upload.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing from storage")

    return FileResponse(
        path=file_path,
        filename=upload.file_name,
        media_type=upload.mime_type
    )
