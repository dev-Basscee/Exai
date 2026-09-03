import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class QuestionCluster(Base):
    __tablename__ = "question_clusters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    representative_question_text = Column(Text, nullable=False)
    frequency_count = Column(Integer, nullable=False, default=1)
    years_seen = Column(JSON, nullable=False, default=list)  # List[str] e.g. ["2021", "2022", "2024"]
    difficulty_score = Column(Float, nullable=False, default=3.0)  # 1.0 (easy) to 5.0 (hard)
    marks_allocated = Column(Float, nullable=True)
    topic_label = Column(String(255), nullable=True, index=True)
    composite_score = Column(Float, nullable=False, default=0.0)  # Overall ranking score
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="question_clusters")
    variants = relationship("QuestionVariant", back_populates="cluster", cascade="all, delete-orphan")
    explanation = relationship("Explanation", back_populates="cluster", uselist=False, cascade="all, delete-orphan")
    feedback = relationship("UserQuestionFeedback", back_populates="cluster", uselist=False, cascade="all, delete-orphan")


class QuestionVariant(Base):
    __tablename__ = "question_variants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("question_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    upload_id = Column(String(36), ForeignKey("uploads.id", ondelete="SET NULL"), nullable=True)
    original_question_text = Column(Text, nullable=False)
    year = Column(String(50), nullable=True)
    page_number = Column(Integer, nullable=True)
    marks = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    cluster = relationship("QuestionCluster", back_populates="variants")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("question_clusters.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    explanation_text = Column(Text, nullable=False)
    grounding_source = Column(String(50), nullable=False, default="general_knowledge")  # material | mixed | general_knowledge
    grounding_references = Column(JSON, nullable=False, default=list)  # List[{"source": str, "page": int, "snippet": str}]
    model_version = Column(String(100), nullable=False, default="claude-3-5-sonnet")
    generated_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    cluster = relationship("QuestionCluster", back_populates="explanation")


class UserQuestionFeedback(Base):
    __tablename__ = "user_question_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False, default="default_user", index=True)
    cluster_id = Column(String(36), ForeignKey("question_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    marked_hard = Column(Boolean, nullable=False, default=False)
    marked_reviewed = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    cluster = relationship("QuestionCluster", back_populates="feedback")
