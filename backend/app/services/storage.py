import os
import shutil
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile
from app.config import settings


class StorageService:
    def __init__(self):
        self.upload_dir = settings.upload_path

    async def save_upload(self, file: UploadFile, workspace_id: str) -> Tuple[str, str, int]:
        """
        Saves an uploaded file to disk within workspace directory.
        Returns (relative_file_path, absolute_file_path, file_size).
        """
        workspace_dir = self.upload_dir / workspace_id
        workspace_dir.mkdir(parents=True, exist_ok=True)

        original_ext = Path(file.filename or "upload.bin").suffix.lower()
        unique_name = f"{uuid.uuid4().hex}{original_ext}"
        destination_path = workspace_dir / unique_name

        file_size = 0
        with open(destination_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                file_size += len(chunk)
                buffer.write(chunk)

        # Reset cursor in case caller needs to read again
        await file.seek(0)

        rel_path = f"{workspace_id}/{unique_name}"
        return rel_path, str(destination_path), file_size

    def delete_file(self, file_path: str) -> bool:
        """Deletes a file if it exists."""
        try:
            p = Path(file_path)
            if p.exists() and p.is_file():
                p.unlink()
                return True
        except Exception:
            pass
        return False

    def delete_workspace_dir(self, workspace_id: str) -> bool:
        """Deletes all uploaded files for a workspace."""
        try:
            workspace_dir = self.upload_dir / workspace_id
            if workspace_dir.exists() and workspace_dir.is_dir():
                shutil.rmtree(workspace_dir)
                return True
        except Exception:
            pass
        return False


storage_service = StorageService()
