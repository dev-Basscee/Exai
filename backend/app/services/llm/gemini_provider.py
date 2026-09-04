import json
import logging
import re
from typing import Any, Dict, List, Optional
from google import genai
from google.genai import types

from app.config import settings
from app.services.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        if not self.api_key:
            raise ValueError("Gemini API key is not configured.")
        self.client = genai.Client(api_key=self.api_key)

    @staticmethod
    def _extract_json(text: str) -> Any:
        """Strips markdown code fences and parses JSON safely."""
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        return json.loads(text.strip())

    async def segment_questions(
        self,
        raw_text: str,
        filename: str,
        year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        system_instruction = (
            "You are an academic exam parser. Given the extracted text of a past examination paper, "
            "segment it into discrete, individual exam questions.\n\n"
            "STRICT RULES:\n"
            "1. Extract question text verbatim as written. DO NOT paraphrase or summarize.\n"
            "2. Retain sub-parts (e.g. (a), (b), (i), (ii)) attached to the parent question if they form a cohesive unit.\n"
            "3. Extract marks allocated if mentioned (e.g. '[10 marks]' -> 10.0).\n"
            "4. Detect section or question number (e.g. 'Question 1', 'Section B').\n"
            "5. Infer topic/subject domain label (e.g. 'Calculus', 'Organic Chemistry', 'Contract Law').\n"
            "6. Output MUST be a valid JSON array of question objects only. No conversational text."
        )

        user_content = (
            f"Exam File: {filename}\n"
            f"Assigned Year: {year or 'Unknown'}\n\n"
            f"--- DOCUMENT TEXT ---\n{raw_text[:35000]}\n--- END DOCUMENT TEXT ---\n\n"
            "Output JSON format:\n"
            "[\n"
            "  {\n"
            '    "question_text": "...",\n'
            '    "marks": 10.0,\n'
            f'    "year": "{year or ""}",\n'
            '    "section": "Section A",\n'
            '    "topic": "Topic Name"\n'
            "  }\n"
            "]"
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )
            parsed = self._extract_json(response.text or "[]")
            if isinstance(parsed, list):
                results = []
                for item in parsed:
                    if isinstance(item, dict) and item.get("question_text"):
                        item["year"] = item.get("year") or year
                        results.append(item)
                return results
            return []
        except Exception as e:
            logger.error(f"Gemini segmentation failed: {e}")
            raise

    async def generate_explanation(
        self,
        question_text: str,
        context_chunks: List[Dict[str, Any]],
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        system_instruction = (
            "You are an elite academic professor, mathematician, and exam preparation specialist. "
            "Generate a structured, authoritative model answer and explanation for an exam question.\n\n"
            "GROUNDING GUIDELINES:\n"
            "1. Ground your explanation primarily in the provided course material excerpts if they are relevant.\n"
            "2. If the excerpts cover the topic sufficiently, set 'grounding_source' to 'material'.\n"
            "3. If you supplement the excerpts with general domain knowledge, set 'grounding_source' to 'mixed'.\n"
            "4. If no relevant excerpts are provided or they do not cover the question, answer thoroughly using academic knowledge and set 'grounding_source' to 'general_knowledge'.\n"
            "5. Cite the exact excerpts/snippets you referenced in 'grounding_references'.\n\n"
            "MATHEMATICAL & CALCULATION INSTRUCTIONS:\n"
            "If the question involves any mathematical expressions, numerical calculations, physics/engineering problems, or chemistry equations:\n"
            "- Explicitly state all given variables, formulas, and theorems.\n"
            "- Show the complete step-by-step mathematical working and substitution without skipping algebraic steps.\n"
            "- Clearly present the final calculated result with appropriate units and explanations.\n\n"
            "STRUCTURE OF THE EXPLANATION:\n"
            "Format the explanation_text using clean Markdown:\n"
            "- ### 1. Core Principle & Formulas\n"
            "- ### 2. Step-by-Step Mathematical Solution / Working\n"
            "- ### 3. Key Concepts & Definitions\n"
            "- ### 4. Exam Tips & Common Pitfalls to Avoid\n\n"
            "Output MUST be valid JSON matching the requested schema."
        )

        context_str = ""
        if context_chunks:
            context_str = "\n\n".join(
                [f"[Source: {c.get('source_file', 'Study Material')} (Page {c.get('page_number', '?')})]\n{c.get('text', '')}"
                 for c in context_chunks]
            )
        else:
            context_str = "No specific course notes excerpts provided."

        user_content = (
            f"EXAM QUESTION:\n{question_text}\n\n"
            f"RETRIEVED COURSE MATERIAL CONTEXT:\n{context_str}\n\n"
        )
        if custom_instructions:
            user_content += f"STUDENT CUSTOM INSTRUCTIONS:\n{custom_instructions}\n\n"

        user_content += (
            "Output JSON schema:\n"
            "{\n"
            '  "explanation_text": "Markdown formatted explanation...",\n'
            '  "grounding_source": "material" | "mixed" | "general_knowledge",\n'
            '  "grounding_references": [{"source": "filename", "page": 1, "snippet": "..."}]\n'
            "}"
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )
            data = self._extract_json(response.text or "{}")
            return {
                "explanation_text": data.get("explanation_text", ""),
                "grounding_source": data.get("grounding_source", "general_knowledge"),
                "grounding_references": data.get("grounding_references", []),
                "model_version": self.model,
            }
        except Exception as e:
            logger.error(f"Gemini explanation generation failed: {e}")
            raise
