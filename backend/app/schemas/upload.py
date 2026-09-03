from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UploadResponse(BaseModel):
    id: str
    workspace_id: str
    file_name: str
    file_url: Optional[str] = None
    upload_type: str  # 'past_questions' | 'study_material'
    inferred_year: Optional[str] = None
    file_size: int
    mime_type: str
    status: str
    error_message: Optional[str] = None
    pages_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
