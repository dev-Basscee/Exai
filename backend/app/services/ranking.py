import re
from typing import List, Optional


class RankingService:
    @staticmethod
    def assess_difficulty(
        question_text: str,
        marks: Optional[float] = None,
        marked_hard_by_user: bool = False
    ) -> float:
        """
        Assesses question difficulty on a 1.0 (very straightforward) to 5.0 (highly challenging) scale.
        Combines mark allocation, cognitive taxonomy verbs, and user feedback.
        """
        base_score = 3.0

        # Factor 1: Mark allocation
        if marks is not None:
            if marks <= 3:
                base_score = 1.8
            elif marks <= 6:
                base_score = 2.5
            elif marks <= 12:
                base_score = 3.4
            elif marks <= 20:
                base_score = 4.2
            else:
                base_score = 4.8

        # Factor 2: Cognitive taxonomy keywords (Bloom's Revised Taxonomy)
        text_lower = question_text.lower()

        # Lower-order thinking (recall/identify)
        if any(re.search(rf"\b{w}\b", text_lower) for w in ["define", "state", "list", "name", "mention", "identify", "what is"]):
            base_score *= 0.85

        # Mid-order thinking (apply/compute/explain)
        elif any(re.search(rf"\b{w}\b", text_lower) for w in ["calculate", "solve", "determine", "derive", "compute", "implement"]):
            base_score *= 1.15

        # Higher-order thinking (evaluate/critique/prove)
        elif any(re.search(rf"\b{w}\b", text_lower) for w in ["evaluate", "critique", "synthesize", "prove", "discuss critically", "compare and contrast"]):
            base_score *= 1.30

        # Factor 3: User "marked as hard" feedback (US-6)
        if marked_hard_by_user:
            base_score += 0.8

        # Clamp between 1.0 and 5.0
        return round(max(1.0, min(5.0, base_score)), 2)

    @staticmethod
    def compute_scores(
        frequency_count: int,
        total_years: int,
        difficulty_score: float,
        marked_hard: bool = False
    ) -> float:
        """
        Computes composite ranking score for sorting recommendations.
        Formula: 65% Recurrence Frequency + 35% Difficulty + Hard bonus.
        """
        # Frequency ratio: clamped to 1.0
        denom = max(1, total_years)
        freq_ratio = min(1.0, frequency_count / denom)

        # Normalized difficulty (0 to 1)
        norm_diff = (difficulty_score - 1.0) / 4.0

        composite = (freq_ratio * 0.65) + (norm_diff * 0.35)

        if marked_hard:
            composite += 0.15

        return round(composite, 4)


ranking_service = RankingService()
