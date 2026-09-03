from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseLLMProvider(ABC):
    @abstractmethod
    async def segment_questions(
        self,
        raw_text: str,
        filename: str,
        year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Segments raw past exam paper text into individual discrete questions.
        Returns a list of dicts:
        [
            {
                "question_text": str,
                "marks": Optional[float],
                "year": Optional[str],
                "section": Optional[str],
                "topic": Optional[str]
            }
        ]
        """
        pass

    @abstractmethod
    async def generate_explanation(
        self,
        question_text: str,
        context_chunks: List[Dict[str, Any]],
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates a structured, syllabus-grounded model answer / explanation.
        Returns:
        {
            "explanation_text": str,
            "grounding_source": str,  # "material" | "mixed" | "general_knowledge"
            "grounding_references": List[Dict[str, Any]],  # [{"source": ..., "snippet": ...}]
            "model_version": str
        }
        """
        pass
