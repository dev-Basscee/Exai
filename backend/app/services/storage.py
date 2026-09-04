import logging
import os
import shutil
import uuid
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile
from app.config import settings

logger = logging.getLogger("exampredict-storage")


class StorageService:
    def __init__(self):
        self.upload_dir = settings.upload_path
        self._supabase_client = None

    @property
    def supabase_client(self):
        """Lazy-loaded Supabase client for storage operations."""
        if self._supabase_client is None and settings.SUPABASE_URL:
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            if key:
                try:
                    from supabase import create_client
                    self._supabase_client = create_client(settings.SUPABASE_URL, key)
                    # Attempt to ensure storage bucket exists
                    try:
                        self._supabase_client.storage.get_bucket(settings.SUPABASE_STORAGE_BUCKET)
                    except Exception:
                        try:
                            self._supabase_client.storage.create_bucket(
                                settings.SUPABASE_STORAGE_BUCKET,
                                options={"public": False}
                            )
                            logger.info(f"Created Supabase Storage bucket: {settings.SUPABASE_STORAGE_BUCKET}")
                        except Exception as e:
                            logger.debug(f"Bucket check/creation notice: {e}")
                except Exception as e:
                    logger.warning(f"Could not initialize Supabase Storage client: {e}")
        return self._supabase_client

    async def save_upload(self, file: UploadFile, workspace_id: str) -> Tuple[str, str, int]:
        """
        Saves an uploaded file to disk within workspace directory,
        and if STORAGE_TYPE='supabase', also uploads to Supabase Storage.
        Returns (relative_file_path, absolute_file_path, file_size).
        """
        workspace_dir = self.upload_dir / workspace_id
        workspace_dir.mkdir(parents=True, exist_ok=True)

        original_ext = Path(file.filename or "upload.bin").suffix.lower()
        unique_name = f"{uuid.uuid4().hex}{original_ext}"
        destination_path = workspace_dir / unique_name

        file_size = 0
        file_bytes = bytearray()
        with open(destination_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                file_size += len(chunk)
                buffer.write(chunk)
                if settings.STORAGE_TYPE == "supabase":
                    file_bytes.extend(chunk)

        # Reset cursor in case caller needs to read again
        await file.seek(0)

        # Sync to Supabase Storage if configured
        if settings.STORAGE_TYPE == "supabase" and self.supabase_client:
            try:
                storage_path = f"{workspace_id}/{unique_name}"
                content_type = file.content_type or "application/octet-stream"
                self.supabase_client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
                    path=storage_path,
                    file=bytes(file_bytes),
                    file_options={"content-type": content_type}
                )
                logger.info(f"Successfully uploaded {storage_path} to Supabase bucket '{settings.SUPABASE_STORAGE_BUCKET}'")
            except Exception as e:
                logger.warning(f"Failed to upload to Supabase Storage: {e}. Preserved local copy at {destination_path}")

        rel_path = f"{workspace_id}/{unique_name}"
        return rel_path, str(destination_path), file_size

    def delete_file(self, file_path: str) -> bool:
        """Deletes a file if it exists locally and in Supabase Storage."""
        deleted = False
        try:
            p = Path(file_path)
            if p.exists() and p.is_file():
                p.unlink()
                deleted = True
        except Exception:
            pass

        if settings.STORAGE_TYPE == "supabase" and self.supabase_client:
            try:
                rel = str(Path(file_path).relative_to(self.upload_dir)).replace("\\", "/")
                self.supabase_client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([rel])
                deleted = True
            except Exception as e:
                logger.debug(f"Failed removing file from Supabase storage: {e}")

        return deleted

    def delete_workspace_dir(self, workspace_id: str) -> bool:
        """Deletes all uploaded files for a workspace locally and in Supabase."""
        deleted = False
        try:
            workspace_dir = self.upload_dir / workspace_id
            if workspace_dir.exists() and workspace_dir.is_dir():
                shutil.rmtree(workspace_dir)
                deleted = True
        except Exception:
            pass

        if settings.STORAGE_TYPE == "supabase" and self.supabase_client:
            try:
                items = self.supabase_client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).list(workspace_id)
                if items:
                    paths = [f"{workspace_id}/{item['name']}" for item in items if isinstance(item, dict) and "name" in item]
                    if paths:
                        self.supabase_client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove(paths)
                        deleted = True
            except Exception as e:
                logger.debug(f"Failed deleting workspace files from Supabase: {e}")

        return deleted


storage_service = StorageService()
