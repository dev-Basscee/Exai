import asyncio
import logging
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id, get_db_session
from app.models.job import ProcessingJob
from app.models.workspace import Workspace
from app.schemas.job import ProcessingJobResponse
from app.services.pipeline import pipeline_orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workspaces", tags=["Processing"])


@router.post("/{workspace_id}/process", response_model=ProcessingJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_processing_pipeline(
    workspace_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    Triggers the prediction pipeline:
    1. Extract text from uploaded PDFs/DOCXs
    2. Segment past papers into discrete exam questions
    3. Cluster semantically similar questions across years
    4. Rank questions by recurrence frequency and difficulty
    5. Generate syllabus-grounded explanations (RAG)
    """
    # Verify workspace
    ws_query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    ws_res = await db.execute(ws_query)
    if not ws_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    # Check if a job is already processing
    active_job_query = select(ProcessingJob).where(
        ProcessingJob.workspace_id == workspace_id,
        ProcessingJob.status.in_(["pending", "processing"])
    )
    active_job_res = await db.execute(active_job_query)
    existing_job = active_job_res.scalars().first()

    if existing_job:
        return ProcessingJobResponse(
            id=existing_job.id,
            workspace_id=existing_job.workspace_id,
            status=existing_job.status,
            progress_percentage=existing_job.progress_percentage,
            current_step=existing_job.current_step,
            error_message=existing_job.error_message,
            stats=existing_job.stats or {},
            created_at=existing_job.created_at,
            completed_at=existing_job.completed_at
        )

    # Create new job
    job = ProcessingJob(
        workspace_id=workspace_id,
        status="pending",
        progress_percentage=0,
        current_step="queued"
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Launch pipeline in background task
    background_tasks.add_task(pipeline_orchestrator.run_pipeline, workspace_id, job.id)

    return ProcessingJobResponse(
        id=job.id,
        workspace_id=job.workspace_id,
        status=job.status,
        progress_percentage=job.progress_percentage,
        current_step=job.current_step,
        error_message=job.error_message,
        stats=job.stats or {},
        created_at=job.created_at,
        completed_at=job.completed_at
    )


@router.get("/{workspace_id}/status", response_model=ProcessingJobResponse)
async def get_processing_status(
    workspace_id: str,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """Poll processing status for the active or latest background job."""
    ws_query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    ws_res = await db.execute(ws_query)
    if not ws_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    query = select(ProcessingJob).where(ProcessingJob.workspace_id == workspace_id).order_by(ProcessingJob.created_at.desc())
    res = await db.execute(query)
    latest_job = res.scalars().first()

    if not latest_job:
        # Return an idle response if no job has been run yet
        return ProcessingJobResponse(
            id="",
            workspace_id=workspace_id,
            status="idle",
            progress_percentage=0,
            current_step="idle",
            error_message=None,
            stats={},
            created_at=ws_res.scalar_one_or_none().created_at if False else None,
            completed_at=None
        )

    return ProcessingJobResponse(
        id=latest_job.id,
        workspace_id=latest_job.workspace_id,
        status=latest_job.status,
        progress_percentage=latest_job.progress_percentage,
        current_step=latest_job.current_step,
        error_message=latest_job.error_message,
        stats=latest_job.stats or {},
        created_at=latest_job.created_at,
        completed_at=latest_job.completed_at
    )
