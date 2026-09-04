# ExamPredict AI

> **An AI-powered study companion that analyzes academic materials and past questions to predict likely exam questions with detailed, syllabus-grounded explanations.**

Built strictly in accordance with [PRD-ExamPredict-AI (1).md](./PRD-ExamPredict-AI%20(1).md) and [ui.md](./ui.md).

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│              Progressive Web App (React + Vite)        │
│  - Course Workspace Dashboard                          │
│  - Dual-mode Drag-and-Drop Ingestion                   │
│  - Live 5-Step Animated Prediction Pipeline Modal      │
│  - Ranked Predictions Feed with Recurrence & Difficulty│
│  - Syllabus-Grounded Explanations & Source Citations   │
│  - User Feedback Loop (Mark as Hard / Reviewed - US-6) │
│  - Offline Cache Layer (PWA & LocalStorage fallback)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (Vite Proxy)
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend Engine                │
│  - Workspaces & Multi-file Upload Management           │
│  - Text Extraction (PDFs via pypdf, Word via docx, txt)│
│  - Background Pipeline Task Orchestrator               │
│  - TF-IDF & Cosine Similarity Recurrence Clustering    │
│  - Multi-Factor Priority & Difficulty Scoring Engine   │
│  - RAG Semantic Chunking & Grounded Model Answers      │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼──────────┐   ┌────────────▼──────────────┐
│  Google Gemini AI SDK  │   │  Database (SQLite/Postgres│
│  - google-genai        │   │  - Workspaces & Uploads   │
│  - gemini-2.5-flash    │   │  - Extracted Text Pages   │
│  - Question Extraction │   │  - Question Clusters      │
│  - Grounded Model RAG  │   │  - Grounded Explanations  │
└────────────────────────┘   └───────────────────────────┘
```

---

## Features

1. **AI Recurrence Engine (Powered by Google Gemini)**:
   - Uses the official `google-genai` SDK with `gemini-2.5-flash` for high-accuracy exam question segmentation and syllabus-grounded model answers.
   - Graceful fallback to `MockLLMProvider` for offline development and testing when no API key is set.

2. **Dual-Category Ingestion**:
   - Explicitly tag uploads as **Past Questions** (assessment data) or **Study Material** (lecture notes, textbooks).
   - Auto-detects academic years from filenames and headers (e.g. `2022`, `2023`).

3. **Semantic Recurrence Detection**:
   - Groups reworded questions across years using TF-IDF n-gram vectorization and cosine similarity.
   - Retains all historical variations and calculates recurrence rates (e.g. `Appeared 4 times (2020, 2021, 2023)`).

4. **Multi-Factor Priority Ranking**:
   - Combines recurrence frequency, cognitive difficulty (Bloom's taxonomy: *Define* vs *Evaluate/Derive*), mark allocations, and personal user feedback.

5. **Syllabus-Grounded Model Explanations (RAG)**:
   - Chunks course notes and retrieves semantic matches for each question.
   - Structured answers: Core Principle → Step-by-Step Working → Key Takeaways → Pitfalls to Avoid.
   - Grounding transparency badge (`Grounded in Notes`, `Mixed`, `General Knowledge`) with cited note page numbers and snippets.

6. **User Study Feedback Loop (US-6)**:
   - Mark questions as *"still hard for me"* (dynamically recalculates personal priority) or *"reviewed"*.

7. **PWA & Offline Resilience (PRD 6.9)**:
   - Automatically caches generated predictions and model answers locally.
   - Offline banner notifications and seamless review when internet connectivity is poor or unavailable.

---

## 1-Click Quick Start (Windows)

Simply double-click **`run_all.bat`** in this folder!

It will launch:
- **Backend API**: `http://127.0.0.1:8000` (Interactive docs at `http://127.0.0.1:8000/docs`)
- **Frontend App**: `http://localhost:5173`

---

## Manual Startup

### 1. Backend (FastAPI)
```powershell
cd backend
# Optional: Add your Gemini API key in backend/.env:
# GEMINI_API_KEY="your-gemini-api-key"
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React + Vite)
```powershell
cd frontend
npm.cmd run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Running Backend Automated Tests

```powershell
cd backend
.venv\Scripts\python.exe -m pytest tests/ -v
```
All 5 test suites pass with 100% success rate.

---

## Moving the Database to Supabase

1. In your **Supabase Dashboard**, open **Project Settings** -> **Database** and copy your **Connection URI** (use port `6543` for connection pooling or port `5432` for direct).
2. Paste the URI into `backend/.env`:
   ```env
   DATABASE_URL="postgresql+asyncpg://postgres.your-project-ref:your-db-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
   ```
3. Initialize the schema:
   - **Automatic**: Run the backend — tables and indexes are created automatically on startup.
   - **Or in Dashboard**: Paste `supabase_schema.sql` into the Supabase SQL Editor and click **Run**.
4. Migrate existing SQLite data (optional):
   ```powershell
   cd backend
   uv run python migrate_sqlite_to_supabase.py
   ```
