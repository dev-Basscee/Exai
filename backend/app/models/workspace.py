import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False, default="default_user", index=True)
    name = Column(String(255), nullable=False)
    course_code = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    uploads = relationship("Upload", back_populates="workspace", cascade="all, delete-orphan")
    question_clusters = relationship("QuestionCluster", back_populates="workspace", cascade="all, delete-orphan")
    jobs = relationship("ProcessingJob", back_populates="workspace", cascade="all, delete-orphan")
