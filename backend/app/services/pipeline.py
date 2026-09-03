import asyncio
import logging
import traceback
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.workspace import Workspace
from app.models.upload import Upload, ExtractedText
from app.models.prediction import QuestionCluster, QuestionVariant, Explanation, UserQuestionFeedback
from app.models.job import ProcessingJob
from app.services.extractor import extractor_service
from app.services.llm.factory import get_llm_provider
from app.services.segmentation import QuestionSegmentationService
from app.services.clustering import clustering_service
from app.services.ranking import ranking_service
from app.services.rag import RAGService, MaterialChunk

logger = logging.getLogger(__name__)


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PipelineOrchestrator:
    @staticmethod
    async def update_job(
        session: AsyncSession,
        job_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        step: Optional[str] = None,
        error_message: Optional[str] = None,
        stats: Optional[dict] = None
    ) -> None:
        """Helper to update background job progress."""
        query = select(ProcessingJob).where(ProcessingJob.id == job_id)
        result = await session.execute(query)
        job = result.scalar_one_or_none()
        if job:
            if status is not None:
                job.status = status
            if progress is not None:
                job.progress_percentage = progress
            if step is not None:
                job.current_step = step
            if error_message is not None:
                job.error_message = error_message
            if stats is not None:
                current_stats = dict(job.stats or {})
                current_stats.update(stats)
                job.stats = current_stats
            if status in ["completed", "failed"]:
                job.completed_at = get_utc_now()
            await session.commit()

    async def run_pipeline(self, workspace_id: str, job_id: str) -> None:
        """
        Executes the complete ingestion -> extraction -> segmentation ->
        clustering -> ranking -> grounded explanation pipeline.
        """
        logger.info(f"Starting ExamPredict pipeline for workspace {workspace_id}, job {job_id}")

        async with async_session_maker() as session:
            try:
                # Step 1: Mark job as processing
                await self.update_job(session, job_id, status="processing", progress=5, step="extracting")

                # Fetch all workspace uploads
                uploads_query = select(Upload).where(Upload.workspace_id == workspace_id)
                uploads_res = await session.execute(uploads_query)
                uploads = uploads_res.scalars().all()

                if not uploads:
                    raise ValueError("No files have been uploaded to this workspace yet.")

                # Extract text for any pending uploads
                extracted_pages_count = 0
                for upload in uploads:
                    # Check if already extracted
                    check_ext = select(ExtractedText).where(ExtractedText.upload_id == upload.id)
                    existing = await session.execute(check_ext)
                    if existing.scalars().first():
                        continue

                    try:
                        pages, inferred_year = extractor_service.extract(upload.file_path, upload.file_name)
                        if not upload.inferred_year and inferred_year:
                            upload.inferred_year = inferred_year

                        for p in pages:
                            ext_record = ExtractedText(
                                upload_id=upload.id,
                                page_number=p.page_number,
                                raw_text=p.raw_text,
                                cleaned_text=p.cleaned_text
                            )
                            session.add(ext_record)
                            extracted_pages_count += 1

                        upload.status = "processed"
                    except Exception as ext_err:
                        logger.error(f"Extraction failed for file {upload.file_name}: {ext_err}")
                        upload.status = "failed"
                        upload.error_message = str(ext_err)

                await session.commit()
                await self.update_job(session, job_id, progress=25, step="segmenting", stats={"extracted_pages": extracted_pages_count})

                # Step 2: Question Segmentation
                # Filter past questions uploads
                past_questions_uploads = [u for u in uploads if u.upload_type == "past_questions" and u.status == "processed"]
                if not past_questions_uploads:
                    raise ValueError("No valid 'Past Questions' uploads found. Please upload at least one past exam file.")

                llm = get_llm_provider()
                segmentation_service = QuestionSegmentationService(llm)

                all_raw_questions = []
                all_years_seen = set()

                for pq_upload in past_questions_uploads:
                    # Gather extracted texts
                    txt_query = select(ExtractedText).where(ExtractedText.upload_id == pq_upload.id).order_by(ExtractedText.page_number)
                    txt_res = await session.execute(txt_query)
                    pages = txt_res.scalars().all()
                    full_text = "\n\n".join([p.cleaned_text for p in pages if p.cleaned_text])

                    if pq_upload.inferred_year:
                        all_years_seen.add(pq_upload.inferred_year)

                    questions = await segmentation_service.segment_upload(
                        full_text=full_text,
                        filename=pq_upload.file_name,
                        upload_id=pq_upload.id,
                        inferred_year=pq_upload.inferred_year
                    )
                    for q in questions:
                        if q.get("year"):
                            all_years_seen.add(str(q["year"]))
                    all_raw_questions.extend(questions)

                if not all_raw_questions:
                    raise ValueError("Could not extract discrete exam questions from the uploaded past papers.")

                await self.update_job(session, job_id, progress=50, step="clustering", stats={"raw_questions_count": len(all_raw_questions)})

                # Step 3: Semantic Clustering
                clusters = clustering_service.cluster_questions(all_raw_questions)

                await self.update_job(session, job_id, progress=65, step="ranking", stats={"clusters_count": len(clusters)})

                # Step 4: Ranking & Database Insertion
                total_years = max(1, len(all_years_seen))

                # Clear old clusters for this workspace (to allow clean re-processing)
                del_query = delete(QuestionCluster).where(QuestionCluster.workspace_id == workspace_id)
                await session.execute(del_query)
                await session.commit()

                # Prepare study material chunks for RAG
                study_uploads = [u for u in uploads if u.upload_type == "study_material" and u.status == "processed"]
                material_chunks: List[MaterialChunk] = []
                rag_service = RAGService(llm)

                for su in study_uploads:
                    s_query = select(ExtractedText).where(ExtractedText.upload_id == su.id).order_by(ExtractedText.page_number)
                    s_res = await session.execute(s_query)
                    for page in s_res.scalars().all():
                        chunks = rag_service.chunk_material(page.cleaned_text, su.file_name, page.page_number)
                        material_chunks.extend(chunks)

                await self.update_job(
                    session,
                    job_id,
                    progress=75,
                    step="generating_explanations",
                    stats={"study_material_chunks": len(material_chunks)}
                )

                # Persist clusters & variants
                db_clusters = []
                for cl in clusters:
                    # Calculate marks
                    avg_marks = sum(cl.marks_list) / len(cl.marks_list) if cl.marks_list else None
                    diff_score = ranking_service.assess_difficulty(cl.representative_text, avg_marks)
                    years_list = sorted(list(cl.years))
                    comp_score = ranking_service.compute_scores(
                        frequency_count=len(cl.variants),
                        total_years=total_years,
                        difficulty_score=diff_score
                    )

                    cluster_record = QuestionCluster(
                        workspace_id=workspace_id,
                        representative_question_text=cl.representative_text,
                        frequency_count=len(cl.variants),
                        years_seen=years_list,
                        difficulty_score=diff_score,
                        marks_allocated=avg_marks,
                        topic_label=cl.topic,
                        composite_score=comp_score
                    )
                    session.add(cluster_record)
                    await session.flush()  # to obtain cluster_record.id

                    # Add variants
                    for v in cl.variants:
                        variant_record = QuestionVariant(
                            cluster_id=cluster_record.id,
                            upload_id=v.get("upload_id"),
                            original_question_text=v.get("question_text", ""),
                            year=v.get("year"),
                            page_number=v.get("page_number"),
                            marks=v.get("marks")
                        )
                        session.add(variant_record)

                    db_clusters.append(cluster_record)

                await session.commit()

                # Step 5: Generate Explanations (RAG)
                # Sort clusters by composite score to explain highest priority first
                db_clusters.sort(key=lambda c: c.composite_score, reverse=True)

                # Generate model answer explanations for top clusters (or all for MVP)
                explanations_count = 0
                for cluster in db_clusters:
                    try:
                        exp_data = await rag_service.generate_grounded_explanation(
                            question_text=cluster.representative_question_text,
                            material_chunks=material_chunks
                        )

                        explanation_record = Explanation(
                            cluster_id=cluster.id,
                            explanation_text=exp_data.get("explanation_text", ""),
                            grounding_source=exp_data.get("grounding_source", "general_knowledge"),
                            grounding_references=exp_data.get("grounding_references", []),
                            model_version=exp_data.get("model_version", "claude-3-5-sonnet")
                        )
                        session.add(explanation_record)
                        explanations_count += 1
                    except Exception as exp_err:
                        logger.warning(f"Failed to generate explanation for cluster {cluster.id}: {exp_err}")

                await session.commit()

                # Step 6: Mark completed!
                await self.update_job(
                    session,
                    job_id,
                    status="completed",
                    progress=100,
                    step="completed",
                    stats={
                        "clusters_created": len(db_clusters),
                        "explanations_generated": explanations_count,
                        "unique_years_detected": list(all_years_seen)
                    }
                )
                logger.info(f"Pipeline completed successfully for workspace {workspace_id}")

            except Exception as e:
                logger.error(f"Pipeline failed for workspace {workspace_id}: {traceback.format_exc()}")
                await self.update_job(
                    session,
                    job_id,
                    status="failed",
                    progress=0,
                    step="failed",
                    error_message=str(e)
                )


pipeline_orchestrator = PipelineOrchestrator()
