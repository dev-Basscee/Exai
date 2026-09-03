import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user_id, get_db_session
from app.models.prediction import Explanation, QuestionCluster, QuestionVariant, UserQuestionFeedback
from app.models.upload import ExtractedText, Upload
from app.models.workspace import Workspace
from app.schemas.prediction import (
    ExplanationResponse,
    FeedbackResponse,
    FeedbackUpdate,
    GenerateExplanationRequest,
    QuestionClusterDetailResponse,
    QuestionClusterResponse,
    QuestionVariantResponse,
)
from app.services.llm.factory import get_llm_provider
from app.services.rag import MaterialChunk, RAGService
from app.services.ranking import ranking_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Predictions"])


@router.get("/workspaces/{workspace_id}/predictions", response_model=List[QuestionClusterResponse])
async def list_predictions(
    workspace_id: str,
    sort_by: str = Query("recommended", description="Sorting criteria: 'recommended', 'frequency', 'difficulty_high', 'difficulty_low'"),
    topic: Optional[str] = Query(None, description="Filter by topic label"),
    hard_only: bool = Query(False, description="Filter only questions marked as hard"),
    unreviewed_only: bool = Query(False, description="Filter questions not yet marked reviewed"),
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    Returns ranked list of predicted exam questions for a workspace.
    Supports filtering by topic, feedback status, and sorting by frequency or difficulty.
    """
    # Verify workspace
    ws_query = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
    ws_res = await db.execute(ws_query)
    if not ws_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    # Load clusters with relationships
    query = (
        select(QuestionCluster)
        .where(QuestionCluster.workspace_id == workspace_id)
        .options(
            selectinload(QuestionCluster.variants),
            selectinload(QuestionCluster.explanation),
            selectinload(QuestionCluster.feedback)
        )
    )

    if topic:
        query = query.where(QuestionCluster.topic_label.ilike(f"%{topic}%"))

    res = await db.execute(query)
    clusters = res.scalars().all()

    # In-memory filtering for feedback if requested
    filtered_clusters = []
    for c in clusters:
        feedback = c.feedback
        if hard_only:
            if not feedback or not feedback.marked_hard:
                continue
        if unreviewed_only:
            if feedback and feedback.marked_reviewed:
                continue
        filtered_clusters.append(c)

    # Sorting
    if sort_by == "frequency":
        filtered_clusters.sort(key=lambda x: x.frequency_count, reverse=True)
    elif sort_by == "difficulty_high":
        filtered_clusters.sort(key=lambda x: x.difficulty_score, reverse=True)
    elif sort_by == "difficulty_low":
        filtered_clusters.sort(key=lambda x: x.difficulty_score)
    else:  # "recommended"
        filtered_clusters.sort(key=lambda x: x.composite_score, reverse=True)

    results = []
    for c in filtered_clusters:
        exp_dto = None
        if c.explanation:
            exp_dto = ExplanationResponse(
                id=c.explanation.id,
                cluster_id=c.explanation.cluster_id,
                explanation_text=c.explanation.explanation_text,
                grounding_source=c.explanation.grounding_source,
                grounding_references=c.explanation.grounding_references or [],
                model_version=c.explanation.model_version,
                generated_at=c.explanation.generated_at
            )

        fb_dto = None
        if c.feedback:
            fb_dto = FeedbackResponse(
                id=c.feedback.id,
                cluster_id=c.feedback.cluster_id,
                marked_hard=c.feedback.marked_hard,
                marked_reviewed=c.feedback.marked_reviewed,
                notes=c.feedback.notes,
                updated_at=c.feedback.updated_at
            )

        results.append(
            QuestionClusterResponse(
                id=c.id,
                workspace_id=c.workspace_id,
                representative_question_text=c.representative_question_text,
                frequency_count=c.frequency_count,
                years_seen=c.years_seen or [],
                difficulty_score=c.difficulty_score,
                marks_allocated=c.marks_allocated,
                topic_label=c.topic_label,
                composite_score=c.composite_score,
                created_at=c.created_at,
                updated_at=c.updated_at,
                variants_count=len(c.variants),
                explanation=exp_dto,
                feedback=fb_dto
            )
        )

    return results


@router.get("/predictions/{cluster_id}", response_model=QuestionClusterDetailResponse)
async def get_prediction_detail(
    cluster_id: str,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get full details for a predicted question cluster, including all historical variants
    and the complete syllabus-grounded model answer / explanation.
    """
    query = (
        select(QuestionCluster)
        .where(QuestionCluster.id == cluster_id)
        .options(
            selectinload(QuestionCluster.variants),
            selectinload(QuestionCluster.explanation),
            selectinload(QuestionCluster.feedback)
        )
    )
    res = await db.execute(query)
    cluster = res.scalar_one_or_none()

    if not cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question cluster not found")

    # Map variants
    variants_dto = [
        QuestionVariantResponse(
            id=v.id,
            cluster_id=v.cluster_id,
            upload_id=v.upload_id,
            original_question_text=v.original_question_text,
            year=v.year,
            page_number=v.page_number,
            marks=v.marks,
            created_at=v.created_at
        )
        for v in cluster.variants
    ]

    exp_dto = None
    if cluster.explanation:
        exp_dto = ExplanationResponse(
            id=cluster.explanation.id,
            cluster_id=cluster.explanation.cluster_id,
            explanation_text=cluster.explanation.explanation_text,
            grounding_source=cluster.explanation.grounding_source,
            grounding_references=cluster.explanation.grounding_references or [],
            model_version=cluster.explanation.model_version,
            generated_at=cluster.explanation.generated_at
        )

    fb_dto = None
    if cluster.feedback:
        fb_dto = FeedbackResponse(
            id=cluster.feedback.id,
            cluster_id=cluster.feedback.cluster_id,
            marked_hard=cluster.feedback.marked_hard,
            marked_reviewed=cluster.feedback.marked_reviewed,
            notes=cluster.feedback.notes,
            updated_at=cluster.feedback.updated_at
        )

    return QuestionClusterDetailResponse(
        id=cluster.id,
        workspace_id=cluster.workspace_id,
        representative_question_text=cluster.representative_question_text,
        frequency_count=cluster.frequency_count,
        years_seen=cluster.years_seen or [],
        difficulty_score=cluster.difficulty_score,
        marks_allocated=cluster.marks_allocated,
        topic_label=cluster.topic_label,
        composite_score=cluster.composite_score,
        created_at=cluster.created_at,
        updated_at=cluster.updated_at,
        variants_count=len(variants_dto),
        variants=variants_dto,
        explanation=exp_dto,
        feedback=fb_dto
    )


@router.post("/predictions/{cluster_id}/generate-explanation", response_model=ExplanationResponse)
async def generate_cluster_explanation(
    cluster_id: str,
    data: Optional[GenerateExplanationRequest] = None,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    Generates or regenerates a syllabus-grounded model answer / explanation (RAG)
    for a specific predicted question.
    """
    query = (
        select(QuestionCluster)
        .where(QuestionCluster.id == cluster_id)
        .options(selectinload(QuestionCluster.explanation))
    )
    res = await db.execute(query)
    cluster = res.scalar_one_or_none()

    if not cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question cluster not found")

    force = data.force_regenerate if data else False
    if cluster.explanation and not force:
        return ExplanationResponse(
            id=cluster.explanation.id,
            cluster_id=cluster.explanation.cluster_id,
            explanation_text=cluster.explanation.explanation_text,
            grounding_source=cluster.explanation.grounding_source,
            grounding_references=cluster.explanation.grounding_references or [],
            model_version=cluster.explanation.model_version,
            generated_at=cluster.explanation.generated_at
        )

    # Gather study materials for RAG
    llm = get_llm_provider()
    rag = RAGService(llm)

    sm_query = select(Upload).where(
        Upload.workspace_id == cluster.workspace_id,
        Upload.upload_type == "study_material",
        Upload.status == "processed"
    )
    sm_res = await db.execute(sm_query)
    study_uploads = sm_res.scalars().all()

    material_chunks: List[MaterialChunk] = []
    for su in study_uploads:
        txt_query = select(ExtractedText).where(ExtractedText.upload_id == su.id)
        txt_res = await db.execute(txt_query)
        for page in txt_res.scalars().all():
            material_chunks.extend(rag.chunk_material(page.cleaned_text, su.file_name, page.page_number))

    custom_instr = data.custom_instructions if data else None
    exp_data = await rag.generate_grounded_explanation(
        question_text=cluster.representative_question_text,
        material_chunks=material_chunks,
        custom_instructions=custom_instr
    )

    if cluster.explanation:
        # Update existing
        cluster.explanation.explanation_text = exp_data.get("explanation_text", "")
        cluster.explanation.grounding_source = exp_data.get("grounding_source", "general_knowledge")
        cluster.explanation.grounding_references = exp_data.get("grounding_references", [])
        cluster.explanation.model_version = exp_data.get("model_version", "claude-3-5-sonnet")
        exp_record = cluster.explanation
    else:
        exp_record = Explanation(
            cluster_id=cluster.id,
            explanation_text=exp_data.get("explanation_text", ""),
            grounding_source=exp_data.get("grounding_source", "general_knowledge"),
            grounding_references=exp_data.get("grounding_references", []),
            model_version=exp_data.get("model_version", "claude-3-5-sonnet")
        )
        db.add(exp_record)

    await db.commit()
    await db.refresh(exp_record)

    return ExplanationResponse(
        id=exp_record.id,
        cluster_id=exp_record.cluster_id,
        explanation_text=exp_record.explanation_text,
        grounding_source=exp_record.grounding_source,
        grounding_references=exp_record.grounding_references or [],
        model_version=exp_record.model_version,
        generated_at=exp_record.generated_at
    )


@router.patch("/predictions/{cluster_id}/feedback", response_model=FeedbackResponse)
async def update_question_feedback(
    cluster_id: str,
    feedback_data: FeedbackUpdate,
    db: AsyncSession = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    User Story US-6: Mark a question as 'still hard for me' or 'reviewed'.
    Adjusts question ranking score and persists study progress per user.
    """
    query = (
        select(QuestionCluster)
        .where(QuestionCluster.id == cluster_id)
        .options(selectinload(QuestionCluster.feedback))
    )
    res = await db.execute(query)
    cluster = res.scalar_one_or_none()

    if not cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question cluster not found")

    fb = cluster.feedback
    if not fb:
        fb = UserQuestionFeedback(
            cluster_id=cluster.id,
            user_id=user_id,
            marked_hard=False,
            marked_reviewed=False
        )
        db.add(fb)

    if feedback_data.marked_hard is not None:
        fb.marked_hard = feedback_data.marked_hard
        # Adjust cluster difficulty & composite score dynamically
        cluster.difficulty_score = ranking_service.assess_difficulty(
            cluster.representative_question_text,
            cluster.marks_allocated,
            marked_hard_by_user=fb.marked_hard
        )
        total_years = max(1, len(cluster.years_seen or []))
        cluster.composite_score = ranking_service.compute_scores(
            frequency_count=cluster.frequency_count,
            total_years=total_years,
            difficulty_score=cluster.difficulty_score,
            marked_hard=fb.marked_hard
        )

    if feedback_data.marked_reviewed is not None:
        fb.marked_reviewed = feedback_data.marked_reviewed

    if feedback_data.notes is not None:
        fb.notes = feedback_data.notes

    await db.commit()
    await db.refresh(fb)

    return FeedbackResponse(
        id=fb.id,
        cluster_id=fb.cluster_id,
        marked_hard=fb.marked_hard,
        marked_reviewed=fb.marked_reviewed,
        notes=fb.notes,
        updated_at=fb.updated_at
    )
