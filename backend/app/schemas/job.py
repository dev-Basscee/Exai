from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class ProcessingJobResponse(BaseModel):
    id: str
    workspace_id: str
    status: str  # pending, processing, completed, failed
    progress_percentage: int
    current_step: str
    error_message: Optional[str] = None
    stats: Dict[str, Any] = {}
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
