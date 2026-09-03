from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuestionVariantResponse(BaseModel):
    id: str
    cluster_id: str
    upload_id: Optional[str] = None
    original_question_text: str
    year: Optional[str] = None
    page_number: Optional[int] = None
    marks: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExplanationResponse(BaseModel):
    id: str
    cluster_id: str
    explanation_text: str
    grounding_source: str  # 'material' | 'mixed' | 'general_knowledge'
    grounding_references: List[Dict[str, Any]] = []
    model_version: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedbackUpdate(BaseModel):
    marked_hard: Optional[bool] = None
    marked_reviewed: Optional[bool] = None
    notes: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    cluster_id: str
    marked_hard: bool
    marked_reviewed: bool
    notes: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionClusterResponse(BaseModel):
    id: str
    workspace_id: str
    representative_question_text: str
    frequency_count: int
    years_seen: List[str] = []
    difficulty_score: float  # 1.0 to 5.0
    marks_allocated: Optional[float] = None
    topic_label: Optional[str] = None
    composite_score: float
    created_at: datetime
    updated_at: datetime
    variants_count: int = 0
    explanation: Optional[ExplanationResponse] = None
    feedback: Optional[FeedbackResponse] = None

    model_config = ConfigDict(from_attributes=True)


class QuestionClusterDetailResponse(QuestionClusterResponse):
    variants: List[QuestionVariantResponse] = []


class GenerateExplanationRequest(BaseModel):
    custom_instructions: Optional[str] = Field(None, description="Optional extra guidance for the explanation")
    force_regenerate: bool = Field(False, description="Whether to overwrite existing explanation")
