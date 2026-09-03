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
