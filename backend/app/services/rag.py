import logging
import re
from typing import Any, Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)


class MaterialChunk:
    def __init__(self, text: str, source_file: str, page_number: int):
        self.text = text
        self.source_file = source_file
        self.page_number = page_number


class RAGService:
    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider

    @staticmethod
    def chunk_material(text: str, source_file: str, page_number: int, max_chunk_chars: int = 1200) -> List[MaterialChunk]:
        """Splits study material into digestible chunks respecting paragraph boundaries."""
        if not text:
            return []

        paragraphs = text.split("\n\n")
        chunks: List[MaterialChunk] = []
        current_chunk = []
        current_len = 0

        for p in paragraphs:
            p_clean = p.strip()
            if not p_clean:
                continue

            if current_len + len(p_clean) > max_chunk_chars and current_chunk:
                chunks.append(MaterialChunk(
                    text="\n\n".join(current_chunk),
                    source_file=source_file,
                    page_number=page_number
                ))
                current_chunk = []
                current_len = 0

            current_chunk.append(p_clean)
            current_len += len(p_clean)

        if current_chunk:
            chunks.append(MaterialChunk(
                text="\n\n".join(current_chunk),
                source_file=source_file,
                page_number=page_number
            ))

        return chunks

    def retrieve_relevant_chunks(
        self,
        question_text: str,
        material_chunks: List[MaterialChunk],
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant study material chunks for a given question
        using TF-IDF cosine similarity.
        """
        if not material_chunks:
            return []

        corpus = [c.text for c in material_chunks]

        try:
            vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                sublinear_tf=True
            )
            tfidf_matrix = vectorizer.fit_transform([question_text] + corpus)
            q_vector = tfidf_matrix[0]
            doc_vectors = tfidf_matrix[1:]

            scores = cosine_similarity(q_vector, doc_vectors).flatten()
            top_indices = scores.argsort()[::-1][:top_k]

            results = []
            for idx in top_indices:
                score = float(scores[idx])
                # Only include chunks with some semantic overlap
                if score > 0.05:
                    chunk = material_chunks[idx]
                    results.append({
                        "text": chunk.text,
                        "source_file": chunk.source_file,
                        "page_number": chunk.page_number,
                        "score": score
                    })

            return results
        except Exception as e:
            logger.warning(f"TF-IDF retrieval error: {e}")
            # Fallback: take first few chunks
            return [
                {
                    "text": c.text,
                    "source_file": c.source_file,
                    "page_number": c.page_number,
                    "score": 0.1
                }
                for c in material_chunks[:top_k]
            ]

    async def generate_grounded_explanation(
        self,
        question_text: str,
        material_chunks: List[MaterialChunk],
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves relevant course notes and prompts the LLM to generate
        a syllabus-grounded model answer and explanation.
        """
        relevant_chunks = self.retrieve_relevant_chunks(question_text, material_chunks)

        explanation_data = await self.llm.generate_explanation(
            question_text=question_text,
            context_chunks=relevant_chunks,
            custom_instructions=custom_instructions
        )

        return explanation_data
