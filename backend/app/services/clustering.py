import logging
from typing import Any, Dict, List, Set
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class ClusteredQuestion:
    def __init__(self, representative_text: str, topic: str):
        self.representative_text: str = representative_text
        self.topic: str = topic
        self.variants: List[Dict[str, Any]] = []
        self.years: Set[str] = set()
        self.marks_list: List[float] = []

    def add_variant(self, variant: Dict[str, Any]):
        self.variants.append(variant)
        year = variant.get("year")
        if year:
            self.years.add(str(year))
        marks = variant.get("marks")
        if marks is not None:
            try:
                self.marks_list.append(float(marks))
            except (ValueError, TypeError):
                pass

        # Update representative text if this variant is more comprehensive
        var_text = variant.get("question_text", "")
        if len(var_text) > len(self.representative_text) and len(var_text) < 1000:
            self.representative_text = var_text


class QuestionClusteringService:
    def __init__(self, similarity_threshold: float = 0.38):
        self.similarity_threshold = similarity_threshold

    @staticmethod
    def _normalize_for_clustering(text: str) -> str:
        """Strips question numbers, marks, and common boilerplate for better semantic matching."""
        import re
        t = re.sub(r"^(?:Question\s+\d+|Q\d+|\d+[\.\)])\s*[:\.\-]?\s*", "", text, flags=re.IGNORECASE)
        t = re.sub(r"\[\d+\s*marks?\]|\(\d+\s*marks?\)", "", t, flags=re.IGNORECASE)
        return t.strip()

    def cluster_questions(self, raw_questions: List[Dict[str, Any]]) -> List[ClusteredQuestion]:
        """
        Clusters raw questions using TF-IDF n-gram vectorization and cosine similarity.
        Groups semantically similar questions across different years/papers.
        """
        if not raw_questions:
            return []

        if len(raw_questions) == 1:
            q = raw_questions[0]
            cluster = ClusteredQuestion(
                representative_text=q.get("question_text", ""),
                topic=q.get("topic", "General")
            )
            cluster.add_variant(q)
            return [cluster]

        texts = [self._normalize_for_clustering(q.get("question_text", "")) for q in raw_questions]

        # Use word n-grams (1, 2) to catch reworded questions
        try:
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                sublinear_tf=True,
                stop_words="english",
                min_df=1
            )
            tfidf_matrix = vectorizer.fit_transform(texts)
            sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        except Exception as e:
            logger.warning(f"Vectorization failed ({e}), falling back to single clusters per question.")
            clusters = []
            for q in raw_questions:
                c = ClusteredQuestion(q.get("question_text", ""), q.get("topic", "General"))
                c.add_variant(q)
                clusters.append(c)
            return clusters

        num_questions = len(raw_questions)
        assigned: List[bool] = [False] * num_questions
        clusters: List[ClusteredQuestion] = []

        for i in range(num_questions):
            if assigned[i]:
                continue

            # Start a new cluster with question i
            q_i = raw_questions[i]
            cluster = ClusteredQuestion(
                representative_text=q_i.get("question_text", ""),
                topic=q_i.get("topic", "General")
            )
            cluster.add_variant(q_i)
            assigned[i] = True

            # Find all matching questions j >= i + 1
            for j in range(i + 1, num_questions):
                if assigned[j]:
                    continue

                sim = sim_matrix[i, j]
                if sim >= self.similarity_threshold:
                    cluster.add_variant(raw_questions[j])
                    assigned[j] = True

            clusters.append(cluster)

        return clusters


clustering_service = QuestionClusteringService()
