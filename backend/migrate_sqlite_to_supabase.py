"""
SQLite to Supabase PostgreSQL Migration Script for ExamPredict AI.

Usage:
    uv run python migrate_sqlite_to_supabase.py
    # or with custom arguments:
    uv run python migrate_sqlite_to_supabase.py --sqlite exam_predict.db --target "postgresql+asyncpg://postgres.[REF]:[PASS]@[HOST]:6543/postgres"
"""

import argparse
import asyncio
import json
import logging
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base
import app.models  # Ensure all models are registered on Base.metadata

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sqlite-to-supabase")


def parse_datetime(val: Any) -> Optional[datetime]:
    """Parse SQLite timestamp string or return datetime."""
    if val is None:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, str):
        val_clean = val.strip()
        try:
            # Handle ISO format with or without Z
            if val_clean.endswith("Z"):
                val_clean = val_clean[:-1] + "+00:00"
            dt = datetime.fromisoformat(val_clean)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            try:
                dt = datetime.strptime(val_clean, "%Y-%m-%d %H:%M:%S")
                return dt.replace(tzinfo=timezone.utc)
            except Exception:
                return None
    return None


def parse_json(val: Any) -> Any:
    """Parse JSON string from SQLite or return object as-is."""
    if val is None:
        return val
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return val
    return val


def get_sqlite_rows(sqlite_path: str, table_name: str) -> List[Dict[str, Any]]:
    """Fetches all rows from an SQLite table as dictionaries."""
    if not Path(sqlite_path).exists():
        logger.warning(f"SQLite file '{sqlite_path}' does not exist.")
        return []

    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    if not cursor.fetchone():
        conn.close()
        return []

    cursor.execute(f"SELECT * FROM {table_name}")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


async def migrate(sqlite_path: str, target_url: str):
    logger.info("==================================================================")
    logger.info("ExamPredict AI: SQLite -> Supabase PostgreSQL Migration")
    logger.info("==================================================================")
    logger.info(f"Source SQLite: {sqlite_path}")

    # Mask password for display
    masked_url = target_url
    if "@" in target_url and "://" in target_url:
        protocol_and_creds, host_and_db = target_url.split("@", 1)
        protocol, creds = protocol_and_creds.split("://", 1)
        if ":" in creds:
            user, _ = creds.split(":", 1)
            masked_url = f"{protocol}://{user}:***@{host_and_db}"
    logger.info(f"Target Database: {masked_url}")

    if target_url.startswith("sqlite"):
        logger.error("Target database is currently set to SQLite. Please provide your Supabase Postgres URL!")
        logger.error("Example: uv run python migrate_sqlite_to_supabase.py --target \"postgresql+asyncpg://postgres.[REF]:[PASS]@[HOST]:6543/postgres\"")
        sys.exit(1)

    # Setup PostgreSQL engine
    connect_args = {"statement_cache_size": 0}
    engine = create_async_engine(target_url, connect_args=connect_args, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # 1. Initialize schema in Supabase
    logger.info("\nStep 1: Initializing tables in Supabase...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables created / verified successfully in Supabase.")
    except Exception as e:
        logger.error(f"Failed to connect or create tables in Supabase: {e}")
        await engine.dispose()
        sys.exit(1)

    # 2. Migrate tables in topological dependency order
    migration_plan = [
        {
            "name": "workspaces",
            "model": app.models.Workspace,
            "transforms": {
                "created_at": parse_datetime,
                "updated_at": parse_datetime,
            }
        },
        {
            "name": "uploads",
            "model": app.models.Upload,
            "transforms": {
                "created_at": parse_datetime,
            }
        },
        {
            "name": "extracted_texts",
            "model": app.models.ExtractedText,
            "transforms": {
                "created_at": parse_datetime,
            }
        },
        {
            "name": "question_clusters",
            "model": app.models.QuestionCluster,
            "transforms": {
                "years_seen": parse_json,
                "created_at": parse_datetime,
                "updated_at": parse_datetime,
            }
        },
        {
            "name": "question_variants",
            "model": app.models.QuestionVariant,
            "transforms": {
                "created_at": parse_datetime,
            }
        },
        {
            "name": "explanations",
            "model": app.models.Explanation,
            "transforms": {
                "grounding_references": parse_json,
                "generated_at": parse_datetime,
            }
        },
        {
            "name": "user_question_feedback",
            "model": app.models.UserQuestionFeedback,
            "transforms": {
                "marked_hard": lambda v: bool(v) if v is not None else False,
                "marked_reviewed": lambda v: bool(v) if v is not None else False,
                "updated_at": parse_datetime,
            }
        },
        {
            "name": "processing_jobs",
            "model": app.models.ProcessingJob,
            "transforms": {
                "stats": parse_json,
                "created_at": parse_datetime,
                "completed_at": parse_datetime,
            }
        },
    ]

    logger.info("\nStep 2: Migrating data records...")
    total_migrated = 0

    async with session_factory() as session:
        for item in migration_plan:
            table_name = item["name"]
            model = item["model"]
            transforms = item.get("transforms", {})

            rows = get_sqlite_rows(sqlite_path, table_name)
            if not rows:
                logger.info(f"  [o] {table_name}: 0 records in SQLite (skipped)")
                continue

            migrated_for_table = 0
            for raw_row in rows:
                row_data = dict(raw_row)
                # Apply transformations
                for col, fn in transforms.items():
                    if col in row_data:
                        row_data[col] = fn(row_data[col])

                # Use PostgreSQL ON CONFLICT DO NOTHING to ensure idempotency
                stmt = pg_insert(model).values(**row_data).on_conflict_do_nothing(index_elements=["id"])
                try:
                    res = await session.execute(stmt)
                    if res.rowcount > 0:
                        migrated_for_table += 1
                except Exception as ex:
                    logger.warning(f"Failed inserting into {table_name} (ID: {row_data.get('id')}): {ex}")

            await session.commit()
            total_migrated += migrated_for_table
            logger.info(f"  [+] {table_name}: {migrated_for_table}/{len(rows)} records migrated to Supabase")

    await engine.dispose()
    logger.info("\n==================================================================")
    logger.info(f"Migration completed successfully! Total records migrated: {total_migrated}")
    logger.info("Your ExamPredict AI backend is now ready to run against Supabase.")
    logger.info("==================================================================")


def main():
    parser = argparse.ArgumentParser(description="Migrate ExamPredict AI SQLite data to Supabase PostgreSQL")
    parser.add_argument(
        "--sqlite",
        default="./exam_predict.db",
        help="Path to SQLite database file (default: ./exam_predict.db)"
    )
    parser.add_argument(
        "--target",
        default=None,
        help="Supabase Postgres connection URL (default: DATABASE_URL from .env)"
    )
    args = parser.parse_args()

    target_url = args.target or settings.get_async_database_url()
    asyncio.run(migrate(args.sqlite, target_url))


if __name__ == "__main__":
    main()
