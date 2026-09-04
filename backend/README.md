# ExamPredict AI — Backend

> **An AI-powered study companion that ingests academic materials and past questions to predict likely exam questions with detailed, syllabus-grounded explanations.**

Built strictly in accordance with the [ExamPredict AI PRD](../PRD-ExamPredict-AI%20(1).md).

---

## Architecture Overview

```
                          ┌─────────────────────────┐
                          │   PWA Frontend (React)   │
                          │  - Upload UI            │
                          │  - Predictions Feed     │
                          │  - Offline Cache        │
                          └───────────┬─────────────┘
                                      │ HTTPS (REST API)
                          ┌───────────▼─────────────┐
                          │   Backend API (FastAPI)  │
                          │  - Workspaces & Uploads  │
                          │  - Job Orchestrator      │
                          │  - Predictions & RAG     │
                          └─────┬─────────────┬──────┘
                                │             │
                    ┌───────────▼──┐       ┌──▼───────────────┐
                    │ OCR / Parser │       │   Claude LLM     │
                    │ - pypdf      │       │ - Segmentation   │
                    │ - python-docx│       │ - Grounded RAG   │
                    └───────────┬──┘       └──┬───────────────┘
                                │             │
                    ┌───────────▼─────────────▼──┐
                    │ Database (SQLite/Postgres) │
                    │ - Workspaces & Uploads     │
                    │ - Question Clusters        │
                    │ - Grounded Explanations    │
                    │ - User Feedback (US-6)     │
                    └────────────────────────────┘
```

---

## Core Features & Pipeline

1. **Ingestion & Extraction (`services/extractor.py`)**:
   - Digital PDFs (`pypdf`), DOCX (`python-docx`), plain text / markdown.
   - Automatically detects examination year from filename or document header.
   - Extracts and cleans text page-by-page.

2. **Question Segmentation (`services/segmentation.py`)**:
   - Discrete question extraction verbatim as written (no paraphrasing) using Claude LLM.
   - Attaches metadata: marks allocated, section, topic label, and exam year.

3. **Recurrence Detection & Clustering (`services/clustering.py`)**:
   - Groups reworded questions across different exam sessions/years using TF-IDF n-gram vectorization and cosine similarity.
   - Preserves representative phrasing and every original historical variant.

4. **Multi-Factor Ranking (`services/ranking.py`)**:
   - **Frequency Score**: Occurrences across total historical years available.
   - **Difficulty Score**: Derived from mark allocation, Bloom's cognitive taxonomy verbs (*Define* vs *Evaluate/Derive*), and user feedback.
   - **Composite Score**: Weighted rank for optimal study priority.

5. **Syllabus-Grounded RAG Explanations (`services/rag.py`)**:
   - Chunks all uploaded **Study Material** (lecture notes, textbooks).
   - Retrieves high-relevance chunks matching the predicted question.
   - Generates structured model answers (Definition → Step-by-Step Working → Key Takeaways → Pitfalls to Avoid).
   - Labels grounding source transparency (`material`, `mixed`, `general_knowledge`).

6. **User Study Feedback Loop (`api/predictions.py` - US-6)**:
   - Mark questions as *"still hard for me"* or *"reviewed"*.
   - Dynamically recalculates personalized difficulty and ranking.

---

## Quick Start

### 1. Requirements
- Python 3.11+ or `uv` package manager (pre-configured)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

To enable live Claude reasoning, provide your Anthropic key:
```env
ANTHROPIC_API_KEY="your-anthropic-api-key"
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
```
*(Note: If `ANTHROPIC_API_KEY` is not provided, the system gracefully uses `MockLLMProvider` with heuristic segmentation and grounded answers for offline development).*

### 3. Run the Development Server
Using `uv`:
```bash
uv run uvicorn app.main:app --reload --port 8000
```
Or directly with the virtual environment:
```powershell
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

The interactive OpenAPI documentation is available at:
👉 **`http://localhost:8000/docs`**

---

## Moving to Supabase (PostgreSQL & Storage)

ExamPredict AI supports seamless connection to **Supabase PostgreSQL** via `asyncpg`.

### Step 1: Get Supabase Database Connection String
1. Go to your **Supabase Dashboard** -> **Project Settings** -> **Database**.
2. Under **Connection string**, select **URI**.
3. Choose **Transaction Mode** (Port `6543`) for connection pooling, or **Session Mode / Direct** (Port `5432`).
4. Replace `[YOUR-PASSWORD]` with your database password.

### Step 2: Configure `backend/.env`
Update `DATABASE_URL` in `backend/.env`:
```env
# Connection Pooling (Recommended):
DATABASE_URL="postgresql+asyncpg://postgres.your-project-ref:your-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Optional: Supabase Storage & Auth
STORAGE_TYPE="supabase"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="exam-uploads"
```
*(Note: If your URL starts with `postgresql://` or `postgres://`, the backend automatically normalizes it to use `postgresql+asyncpg://` and configures statement caching for Supabase PgBouncer compatibility).*

### Step 3: Initialize Database Schema
You can initialize the database tables in either of two ways:
- **Option A (Automatic)**: Simply start the backend (`uv run uvicorn app.main:app`). It will automatically create all tables and indexes.
- **Option B (Supabase Dashboard SQL Editor)**: Open `supabase_schema.sql` (in the project root or `backend/`), copy the contents, and click **Run** in the Supabase SQL Editor.

### Step 4: Migrate Existing SQLite Data to Supabase (Optional)
If you have existing workspaces, uploads, or predictions in `exam_predict.db`:
```powershell
uv run python migrate_sqlite_to_supabase.py
```
This migrates all workspaces, uploads, extracted text, question clusters, variants, explanations, feedback, and background jobs preserving all relationships.

---

## API Endpoints Reference

### Workspaces
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workspaces` | Create course workspace |
| `GET` | `/api/workspaces` | List all workspaces with stats |
| `GET` | `/api/workspaces/{id}` | Get workspace details |
| `PUT` | `/api/workspaces/{id}` | Update workspace |
| `DELETE` | `/api/workspaces/{id}` | Delete workspace and files |

### Uploads
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workspaces/{id}/uploads` | Upload past questions or study material (`multipart/form-data`) |
| `GET` | `/api/workspaces/{id}/uploads` | List uploaded files & processing status |
| `DELETE` | `/api/workspaces/{id}/uploads/{upload_id}` | Delete uploaded file |
| `GET` | `/api/uploads/{upload_id}/download` | Download uploaded file |

### Processing Pipeline
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workspaces/{id}/process` | Trigger background extraction, segmentation, clustering, ranking & RAG |
| `GET` | `/api/workspaces/{id}/status` | Poll active job progress percentage & current step |

### Predictions & Explanations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{id}/predictions` | Get ranked predictions (sort by `recommended`, `frequency`, `difficulty_high`, `difficulty_low`) |
| `GET` | `/api/predictions/{cluster_id}` | Get cluster details, historical variants, and full explanation |
| `POST` | `/api/predictions/{cluster_id}/generate-explanation` | Regenerate grounded explanation with custom student instructions |
| `PATCH` | `/api/predictions/{cluster_id}/feedback` | Mark question as hard / reviewed (US-6) |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and active configuration status |

---

## Running the Automated Test Suite

Run the full async test suite with pytest:
```powershell
uv run pytest tests/ -v
```
All tests verify workspace creation, multi-file uploads, background pipeline execution, semantic clustering, ranking, RAG explanations, and user feedback.
