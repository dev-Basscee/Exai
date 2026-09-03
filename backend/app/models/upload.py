
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_url = Column(String(512), nullable=True)
    upload_type = Column(String(50), nullable=False, index=True)  # 'past_questions' | 'study_material'
    inferred_year = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=False, default=0)
    mime_type = Column(String(100), nullable=False, default="application/octet-stream")
    status = Column(String(50), nullable=False, default="pending")  # pending, processing, processed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="uploads")
    extracted_texts = relationship("ExtractedText", back_populates="upload", cascade="all, delete-orphan")


class ExtractedText(Base):
    __tablename__ = "extracted_texts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    upload_id = Column(String(36), ForeignKey("uploads.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False, default=1)
    raw_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    upload = relationship("Upload", back_populates="extracted_texts")
