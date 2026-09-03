import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="pending")  # pending, processing, completed, failed
    progress_percentage = Column(Integer, nullable=False, default=0)
    current_step = Column(String(100), nullable=False, default="idle")  # extracting, segmenting, clustering, ranking, generating_explanations, completed
    error_message = Column(Text, nullable=True)
    stats = Column(JSON, nullable=False, default=dict)  # {"questions_extracted": 15, "clusters_created": 6, ...}
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    workspace = relationship("Workspace", back_populates="jobs")
