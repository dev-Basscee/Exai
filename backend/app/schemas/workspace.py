from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Course or workspace name, e.g. 'CHEM 201 Organic Chemistry'")
    course_code: Optional[str] = Field(None, max_length=50, description="Optional short course code, e.g. 'CHEM 201'")
    description: Optional[str] = Field(None, description="Optional workspace description")


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    course_code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None


class WorkspaceResponse(WorkspaceBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    uploads_count: int = 0
    past_questions_count: int = 0
    study_materials_count: int = 0
    predictions_count: int = 0

    model_config = ConfigDict(from_attributes=True)
