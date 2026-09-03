import re
from typing import Any, Dict, List, Optional
from app.services.llm.base import BaseLLMProvider


class MockLLMProvider(BaseLLMProvider):
    """
    Mock LLM provider that uses robust heuristics and pattern matching.
    Enables immediate offline development, CI/CD testing, and smooth fallback
    when no LLM API key is provided.
    """

    async def segment_questions(
        self,
        raw_text: str,
        filename: str,
        year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        questions: List[Dict[str, Any]] = []

        # Split text on common exam question indicators
        # e.g., "Question 1", "Q1.", "1. ", "Question 2(a)"
        pattern = re.compile(
            r"(?:^|\n\s*)(?:Question\s+(\d+|[A-Z])|Q(\d+)|(\d+)\.)\s*[:\.\-]?\s*",
            re.IGNORECASE,
        )

        matches = list(pattern.finditer(raw_text))

        if not matches or len(matches) < 2:
            # Fallback: split by double newlines into substantial paragraphs
            paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > 40]
            for idx, p in enumerate(paragraphs[:15]):
                # Look for marks
                mark_match = re.search(r"\[(\d+)\s*marks?\]|\((\d+)\s*marks?\)", p, re.IGNORECASE)
                marks = float(mark_match.group(1) or mark_match.group(2)) if mark_match else 10.0

                questions.append({
                    "question_text": p,
                    "marks": marks,
                    "year": year,
                    "section": f"Section {chr(65 + (idx // 5))}",
                    "topic": self._infer_topic(p),
                })
            return questions

        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(raw_text)
            q_chunk = raw_text[start:end].strip()

            if len(q_chunk) < 20:
                continue

            # Extract marks if present
            mark_match = re.search(r"\[(\d+)\s*marks?\]|\((\d+)\s*marks?\)", q_chunk, re.IGNORECASE)
            marks = float(mark_match.group(1) or mark_match.group(2)) if mark_match else 10.0

            q_num = matches[i].group(1) or matches[i].group(2) or matches[i].group(3) or str(i + 1)

            questions.append({
                "question_text": q_chunk,
                "marks": marks,
                "year": year,
                "section": f"Question {q_num}",
                "topic": self._infer_topic(q_chunk),
            })

        return questions

    @staticmethod
    def _infer_topic(text: str) -> str:
        text_lower = text.lower()
        if any(w in text_lower for w in ["reaction", "molecule", "acid", "base", "synthesis", "equilibrium"]):
            return "Chemistry"
        if any(w in text_lower for w in ["force", "velocity", "energy", "quantum", "electric", "magnetic"]):
            return "Physics"
        if any(w in text_lower for w in ["cell", "dna", "gene", "protein", "organism", "enzyme"]):
            return "Biology"
        if any(w in text_lower for w in ["integral", "derivative", "matrix", "vector", "equation", "function"]):
            return "Mathematics"
        if any(w in text_lower for w in ["algorithm", "complexity", "database", "network", "cache", "thread"]):
            return "Computer Science"
        if any(w in text_lower for w in ["law", "contract", "tort", "statute", "court", "liability"]):
            return "Law"
        if any(w in text_lower for w in ["market", "inflation", "gdp", "supply", "demand", "fiscal"]):
            return "Economics"
        return "Core Concepts"

    async def generate_explanation(
        self,
        question_text: str,
        context_chunks: List[Dict[str, Any]],
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        grounding_source = "general_knowledge"
        references = []

        if context_chunks:
            grounding_source = "material" if len(context_chunks) >= 2 else "mixed"
            for c in context_chunks[:3]:
                snippet = c.get("text", "")[:180] + "..."
                references.append({
                    "source": c.get("source_file", "Lecture Notes"),
                    "page": c.get("page_number", 1),
                    "snippet": snippet
                })

        # Generate a structured model explanation
        core_topic = self._infer_topic(question_text)
        preview_q = question_text[:120].strip()

        context_summary = ""
        if references:
            context_summary = f"\n*Referenced from uploaded notes: {references[0]['source']} (Page {references[0]['page']})*\n"

        explanation_md = (
            f"### 1. Core Principle & Definition\n"
            f"This question examines fundamental principles in **{core_topic}**. "
            f"Specifically, it addresses the theoretical foundation and practical application "
            f"behind: *\"{preview_q}...\"*.\n\n"
            f"{context_summary}\n"
            f"### 2. Detailed Step-by-Step Model Answer\n"
            f"- **Step 1: Problem Decomposition & Initial Setup**\n"
            f"  Identify the given conditions, boundary constraints, and primary governing relationships. "
            f"State any relevant assumptions clearly at the beginning of your response to secure method marks.\n\n"
            f"- **Step 2: Analysis & Derivation**\n"
            f"  Apply the key principles step by step. Justify each analytical transition with the corresponding theorem or law.\n\n"
            f"- **Step 3: Conclusion & Synthesis**\n"
            f"  Summarize the definitive outcome with appropriate scientific/academic terminology and units where applicable.\n\n"
            f"### 3. Key Concepts & Frameworks\n"
            f"- High-yield concept: Ensure standard definitions are stated verbatim.\n"
            f"- Structured argumentation: Use clear headings or numbered bullet points for each sub-question.\n\n"
            f"### 4. Exam Tips & Common Mistakes\n"
            f"- ⚠️ **Common Pitfall**: Rushing past definitions without addressing all parts of the prompt.\n"
            f"- 💡 **Pro-Tip**: When mark allocation is high, examiners look for explicit definitions, intermediate working, and a concluding evaluation."
        )

        return {
            "explanation_text": explanation_md,
            "grounding_source": grounding_source,
            "grounding_references": references,
            "model_version": "mock-heuristics-v1",
        }
