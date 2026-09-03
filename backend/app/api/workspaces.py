import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user_id, get_db_session
from app.models.upload import ExtractedText, Upload
from app.models.prediction import QuestionCluster
from app.models.workspace import Workspace
from app.schemas.upload import UploadResponse
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate
from app.services.storage import storage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    data: WorkspaceCreate,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new course workspace."""
    workspace = Workspace(
        user_id=user_id,
        name=data.name.strip(),
        course_code=data.course_code.strip() if data.course_code else None,
        description=data.description.strip() if data.description else None
    )
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)

    return WorkspaceResponse(
        id=workspace.id,
        user_id=workspace.user_id,
        name=workspace.name,
        course_code=workspace.course_code,
        description=workspace.description,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
        uploads_count=0,
        past_questions_count=0,
        study_materials_count=0,
        predictions_count=0
    )


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """List all course workspaces for the current user with summary statistics."""
    query = select(Workspace).where(Workspace.user_id == user_id).order_by(Workspace.created_at.desc())
    res = await db.execute(query)
    workspaces = res.scalars().all()

    results = []
    for ws in workspaces:
        # Count total uploads and breakdown
        u_query = select(
            func.count(Upload.id),
            func.count().filter(Upload.upload_type == "past_questions"),
            func.count().filter(Upload.upload_type == "study_material")
        ).where(Upload.workspace_id == ws.id)
        u_res = await db.execute(u_query)
        total_u, pq_count, sm_count = u_res.one()

        # Count predicted question clusters
        p_query = select(func.count(QuestionCluster.id)).where(QuestionCluster.workspace_id == ws.id)
        p_res = await db.execute(p_query)
        pred_count = p_res.scalar() or 0

        results.append(
            WorkspaceResponse(
                id=ws.id,
                user_id=ws.user_id,
                name=ws.name,
                course_code=ws.course_code,
                description=ws.description,
                created_at=ws.created_at,
                updated_at=ws.updated_at,
                uploads_count=total_u or 0,
                past_questions_count=pq_count or 0,
                study_materials_count=sm_count or 0,
                predictions_count=pred_count
            )
        )

    return results


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """Get details of a specific course workspace."""
    query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    res = await db.execute(query)
    ws = res.scalar_one_or_none()

    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    u_query = select(
        func.count(Upload.id),
        func.count().filter(Upload.upload_type == "past_questions"),
        func.count().filter(Upload.upload_type == "study_material")
    ).where(Upload.workspace_id == ws.id)
    u_res = await db.execute(u_query)
    total_u, pq_count, sm_count = u_res.one()

    p_query = select(func.count(QuestionCluster.id)).where(QuestionCluster.workspace_id == ws.id)
    p_res = await db.execute(p_query)
    pred_count = p_res.scalar() or 0

    return WorkspaceResponse(
        id=ws.id,
        user_id=ws.user_id,
        name=ws.name,
        course_code=ws.course_code,
        description=ws.description,
        created_at=ws.created_at,
        updated_at=ws.updated_at,
        uploads_count=total_u or 0,
        past_questions_count=pq_count or 0,
        study_materials_count=sm_count or 0,
        predictions_count=pred_count
    )


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    data: WorkspaceUpdate,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """Update workspace name, course code, or description."""
    query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    res = await db.execute(query)
    ws = res.scalar_one_or_none()

    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    if data.name is not None:
        ws.name = data.name.strip()
    if data.course_code is not None:
        ws.course_code = data.course_code.strip()
    if data.description is not None:
        ws.description = data.description.strip()

    await db.commit()
    await db.refresh(ws)

    return await get_workspace(workspace_id, db, user_id)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: str,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a workspace and all associated files, uploads, and predictions."""
    query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    res = await db.execute(query)
    ws = res.scalar_one_or_none()

    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    # Clean up files on disk
    storage_service.delete_workspace_dir(workspace_id)

    # Cascade deletes DB records
    await db.delete(ws)
    await db.commit()
    return None


# -------------------------------------------------------------
# UPLOADS MANAGEMENT
# -------------------------------------------------------------

@router.post("/{workspace_id}/uploads", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    workspace_id: str,
    file: UploadFile = File(...),
    upload_type: str = Form(..., description="'past_questions' or 'study_material'"),
    inferred_year: Optional[str] = Form(None, description="Optional year, e.g. '2023'"),
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    Upload a file (PDF, DOCX, TXT) to the workspace.
    Tag as 'past_questions' or 'study_material'.
    """
    # Verify workspace exists
    ws_query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    ws_res = await db.execute(ws_query)
    if not ws_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    if upload_type not in ["past_questions", "study_material"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="upload_type must be either 'past_questions' or 'study_material'"
        )

    # Save to storage
    try:
        rel_path, abs_path, file_size = await storage_service.save_upload(file, workspace_id)
    except Exception as e:
        logger.error(f"Failed to store file: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save uploaded file.")

    # Create DB record
    upload = Upload(
        workspace_id=workspace_id,
        file_name=file.filename or "uploaded_file",
        file_path=abs_path,
        upload_type=upload_type,
        inferred_year=inferred_year.strip() if inferred_year else None,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        status="pending"
    )
    db.add(upload)
    await db.commit()
    await db.refresh(upload)

    return UploadResponse(
        id=upload.id,
        workspace_id=upload.workspace_id,
        file_name=upload.file_name,
        file_url=f"/api/uploads/{upload.id}/download",
        upload_type=upload.upload_type,
        inferred_year=upload.inferred_year,
        file_size=upload.file_size,
        mime_type=upload.mime_type,
        status=upload.status,
        error_message=upload.error_message,
        pages_count=0,
        created_at=upload.created_at
    )


@router.get("/{workspace_id}/uploads", response_model=List[UploadResponse])
async def list_uploads(
    workspace_id: str,
    upload_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """List all uploaded files in a workspace with their extraction status."""
    ws_query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    ws_res = await db.execute(ws_query)
    if not ws_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    query = select(Upload).where(Upload.workspace_id == workspace_id)
    if upload_type:
        query = query.where(Upload.upload_type == upload_type)
    query = query.order_by(Upload.created_at.desc())

    res = await db.execute(query)
    uploads = res.scalars().all()

    results = []
    for u in uploads:
        p_query = select(func.count(ExtractedText.id)).where(ExtractedText.upload_id == u.id)
        p_res = await db.execute(p_query)
        pages_count = p_res.scalar() or 0

        results.append(
            UploadResponse(
                id=u.id,
                workspace_id=u.workspace_id,
                file_name=u.file_name,
                file_url=f"/api/uploads/{u.id}/download",
                upload_type=u.upload_type,
                inferred_year=u.inferred_year,
                file_size=u.file_size,
                mime_type=u.mime_type,
                status=u.status,
                error_message=u.error_message,
                pages_count=pages_count,
                created_at=u.created_at
            )
        )

    return results


@router.delete("/{workspace_id}/uploads/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upload(
    workspace_id: str,
    upload_id: str,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """Delete an uploaded file from a workspace."""
    query = select(Upload).join(Workspace).where(
        Upload.id == upload_id,
        Upload.workspace_id == workspace_id,
        Workspace.user_id == user_id
    )
    res = await db.execute(query)
    upload = res.scalar_one_or_none()

    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")

    storage_service.delete_file(upload.file_path)
    await db.delete(upload)
    await db.commit()
    return None
