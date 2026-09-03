import logging
from typing import Any, Dict, List, Optional
from app.services.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)


class QuestionSegmentationService:
    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider

    async def segment_upload(
        self,
        full_text: str,
        filename: str,
        upload_id: str,
        inferred_year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Takes raw document text from an exam upload and extracts discrete questions.
        Attaches metadata: upload_id, year, original marks, section, topic.
        """
        if not full_text or len(full_text.strip()) < 10:
            logger.warning(f"Upload {upload_id} ({filename}) has insufficient text for segmentation.")
            return []

        try:
            questions = await self.llm.segment_questions(
                raw_text=full_text,
                filename=filename,
                year=inferred_year
            )
        except Exception as e:
            logger.error(f"Segmentation error on {filename}: {e}")
            # Non-fatal: return empty list or fallback
            return []

        # Enrich with upload reference
        for q in questions:
            q["upload_id"] = upload_id
            if not q.get("year") and inferred_year:
                q["year"] = inferred_year

        return questions
