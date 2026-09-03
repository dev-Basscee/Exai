# Product Requirements Document: ExamPredict AI
**An AI-powered study companion that analyzes academic materials and past questions to predict likely exam questions with detailed explanations**

Version: 1.0
Author: [Your Name]
Date: September 2, 2026
Status: Pre-development / MVP Planning

---

## 1. Executive Summary

ExamPredict AI is an installable Progressive Web App (PWA) that ingests a student's academic materials — course notes, textbooks, and past exam questions — and produces a ranked list of predicted exam questions with detailed, syllabus-grounded explanations. Predictions are ranked by **recurrence frequency** (how often a topic/question has appeared across past papers) and **difficulty** (derived from mark allocation, question complexity, and user feedback).

The product is subject-agnostic by design: rather than building subject-specific parsing logic, the system relies on LLM reasoning (Claude) to segment, cluster, and explain questions across any discipline — sciences, humanities, law, etc.

---

## 2. Problem Statement

Students preparing for exams manually review years of past questions to guess what's likely to reappear — a process that is:
- **Time-consuming**: manually cross-referencing questions across multiple years of past papers
- **Error-prone**: humans miss patterns, especially when questions are reworded across years
- **Inequitable**: only diligent/experienced students do this well; others miss it entirely
- **Disconnected from study material**: even after identifying a likely question, students must separately locate and synthesize the answer from notes/textbooks

## 3. Goals

### 3.1 Primary Goals (v1 / MVP)
1. Allow a student to upload past questions + course material (any subject) in common formats (PDF, image, DOCX)
2. Extract and cluster semantically similar questions across multiple years/sessions
3. Rank clustered questions by frequency of recurrence and difficulty
4. Generate detailed, syllabus-grounded explanations/model answers for each predicted question
5. Present results in an installable PWA that works reasonably well offline for previously generated content

### 3.2 Non-Goals (explicitly out of scope for v1)
- Real-time collaborative study (multi-user shared workspaces)
- Grading/marking student-submitted answers
- Building a proprietary question bank independent of user uploads
- Native mobile apps (iOS/Android App Store builds)
- Multi-language OCR beyond the primary target language(s) — can be added later

## 4. Target Users & Personas

**Primary persona: "Chidi", university/college student**
- Has access to 3–8 years of past exam papers for a course, often as scanned PDFs or phone photos
- Has lecture notes/slides, sometimes messy or incomplete
- Wants to know: "What's actually likely to come out, and how do I answer it well?"
- Time-constrained, often studying close to exam date

**Secondary persona: study groups (friends/classmates)** — pooled uploads could improve prediction quality per course, but each user's session/output remains individual in v1 (no shared accounts yet).

## 5. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|---------------|------------|
| US-1 | Student | Upload multiple past question PDFs/images for a course | The app can analyze patterns across years |
| US-2 | Student | Upload my lecture notes/textbook material | Explanations are grounded in what I was actually taught |
| US-3 | Student | See a ranked list of predicted questions | I know what to prioritize studying |
| US-4 | Student | See why a question is ranked high (e.g. "appeared 6/8 years") | I trust the prediction |
| US-5 | Student | Get a detailed explanation/model answer for each predicted question | I can actually study the answer, not just the question |
| US-6 | Student | Mark a question as "still hard for me" | Future ranking/practice reflects my personal weak spots |
| US-7 | Student | Install the app on my phone home screen | I can access it like a native app, including some offline access |
| US-8 | Student | Revisit previously generated results without re-uploading | I don't waste time/tokens reprocessing the same material |

## 6. Core Functional Requirements

### 6.1 Ingestion & Upload
- Accept file types: PDF (scanned + digital), JPG/PNG (photos of pages), DOCX
- Multi-file upload per course/subject "workspace"
- Tag each upload as either **Past Questions** or **Study Material** (notes/textbook) — this distinction drives the pipeline
- Show upload progress and basic validation (file size limits, unsupported format warnings)

### 6.2 Text Extraction (OCR/Parsing)
- Digital PDFs/DOCX: direct text extraction
- Scanned PDFs/images: OCR pipeline
- Output: normalized plain text + metadata (source file, page number, inferred year/session if detectable from filename or header text)

### 6.3 Question Segmentation
- LLM-based segmentation: given raw extracted text from a "Past Questions" upload, identify and extract individual discrete questions
- Attach metadata per question where inferable: year/session, marks allocated, section/topic label

### 6.4 Clustering (Recurrence Detection)
- Group semantically similar questions across different years/uploads even when reworded
- Each cluster = one "predicted question" candidate
- Store: cluster's representative question phrasing, all original variants, count of occurrences, years in which it appeared

### 6.5 Ranking & Scoring
- **Frequency score**: occurrences / total years of past questions available
- **Difficulty score**: derived initially from (a) marks allocated if extractable, (b) LLM-assessed complexity of expected answer, (c) later refined by user "hard" feedback (US-6)
- Composite ranking surfaced to user, sortable by frequency, difficulty, or "recommended" (combined)

### 6.6 Explanation Generation
- RAG-style retrieval: for a given predicted question, retrieve the most relevant chunks from the student's uploaded Study Material
- Generate a detailed, structured explanation/model answer grounded in retrieved material first, with general knowledge used to fill gaps when material is insufficient
- Clearly indicate (subtly, e.g. a small label) when an explanation relies significantly on general knowledge vs. the student's own material, for trust/transparency

### 6.7 Results Presentation
- List/grid of predicted questions per course workspace, each showing: question text, frequency badge, difficulty badge, expandable detailed explanation
- Filter/sort controls
- Per-question "mark as hard" / "mark as reviewed" state, persisted per user

### 6.8 Workspace & History
- Course "workspaces" persist uploaded material and generated results
- Revisiting a workspace should not require re-running the full pipeline unless new material is uploaded

### 6.9 PWA Requirements
- Web app manifest (name, icons, theme colors, `display: standalone`)
- Service worker: cache app shell (JS/CSS/static assets) and previously fetched results (e.g., via IndexedDB or Cache API) so a student can review generated explanations with poor/no connectivity
- New uploads/generation require connectivity (backend processing); this should be communicated clearly in the UI when offline

## 7. Non-Functional Requirements

- **Accuracy over speed for generation steps**: prediction/explanation quality matters more than raw latency, but processing should complete within a reasonable window (target: under ~2–3 minutes for a typical course's worth of material in v1; can be optimized later)
- **Data privacy**: uploaded academic material is personal/institutional content — store securely, do not use for training external models beyond the API calls needed to serve the feature, and support account-scoped data deletion
- **Cost control**: LLM calls (segmentation, clustering, generation) should be batched/cached where possible to avoid redundant reprocessing and control API spend
- **Subject-agnostic**: no hardcoded subject-specific logic; all differentiation handled via LLM prompting

## 8. System Architecture

```
┌─────────────────────────┐
│   PWA Frontend (React)   │
│  - Upload UI              │
│  - Results/Explanation UI │
│  - Service Worker (cache) │
└───────────┬──────────────┘
            │ HTTPS (REST API)
┌───────────▼──────────────┐
│   Backend API (FastAPI)   │
│  - Auth                   │
│  - Upload handling         │
│  - Job orchestration       │
└─────┬────────────┬────────┘
      │             │
┌─────▼─────┐ ┌─────▼──────────────┐
│ OCR/Parse  │ │  Claude API calls   │
│ (Tesseract/│ │  - Segmentation      │
│  PyMuPDF)  │ │  - Clustering         │
└─────┬─────┘ │  - Explanation gen    │
      │       └─────┬──────────────┘
┌─────▼───────────────▼─────┐
│  Postgres (Supabase)        │
│  - Users, Workspaces         │
│  - Uploaded files (Storage)  │
│  - Extracted text             │
│  - Question clusters          │
│  - Generated explanations     │
└────────────────────────────┘
```

### 8.1 Recommended Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite, Tailwind CSS | PWA plugin (`vite-plugin-pwa`) for manifest + service worker generation |
| Backend | Python + FastAPI | Async support, easy integration with OCR/PDF libraries and Claude SDK |
| OCR | Tesseract (via `pytesseract`) for images/scanned PDFs | Consider a cloud OCR fallback later if accuracy is insufficient for handwriting |
| PDF/DOCX parsing | `PyMuPDF` (fitz) for PDFs, `python-docx` for Word files | |
| LLM | Claude API (Sonnet-tier model) | Used for segmentation, clustering, explanation generation |
| Database | Postgres via Supabase | Also provides auth and file storage, reducing infra to manage |
| File storage | Supabase Storage | Stores original uploaded files |
| Background jobs | FastAPI `BackgroundTasks` for MVP; consider a queue (Celery/Redis or a lightweight alternative) once processing volume grows | Processing (OCR + multiple LLM calls) shouldn't block the HTTP request |
| Hosting | Vercel (frontend), Render or Railway (backend) | Cheap, simple CI/CD for MVP stage |

## 9. Data Model (Initial)

**users**
- id, email, created_at, auth fields (via Supabase Auth)

**workspaces** (one per course/subject)
- id, user_id, name (e.g. "CHEM 201"), created_at

**uploads**
- id, workspace_id, file_url, upload_type (`past_questions` | `study_material`), original_filename, inferred_year, status (`pending` | `processed` | `failed`), created_at

**extracted_texts**
- id, upload_id, page_number, raw_text, cleaned_text

**question_clusters**
- id, workspace_id, representative_question_text, frequency_count, years_seen (array), difficulty_score, marks_allocated (nullable), topic_label, created_at

**question_variants**
- id, cluster_id, upload_id, original_question_text, year

**explanations**
- id, cluster_id, explanation_text, grounding_source (`material` | `mixed` | `general_knowledge`), generated_at, model_version

**user_question_feedback**
- id, user_id, cluster_id, marked_hard (bool), marked_reviewed (bool), updated_at

## 10. Key API Endpoints (v1)

```
POST   /api/workspaces                     Create a new course workspace
GET    /api/workspaces/:id                 Get workspace details + status

POST   /api/workspaces/:id/uploads         Upload a file (past_questions or study_material)
GET    /api/workspaces/:id/uploads         List uploads + processing status

POST   /api/workspaces/:id/process         Trigger pipeline: extract → segment → cluster → rank
GET    /api/workspaces/:id/status          Poll processing status (for async jobs)

GET    /api/workspaces/:id/predictions     Get ranked list of predicted question clusters
GET    /api/predictions/:cluster_id        Get full detail incl. explanation

POST   /api/predictions/:cluster_id/generate-explanation   Generate/regenerate explanation (RAG)
PATCH  /api/predictions/:cluster_id/feedback                Mark hard/reviewed
```

## 11. LLM Prompting Strategy (High-Level)

**Segmentation prompt** (per past-question upload): instruct the model to return structured JSON — array of `{question_text, year_if_detectable, marks_if_detectable, section}` — explicitly told not to paraphrase, only extract as-written.

**Clustering**: two viable approaches, either combinable:
1. Embedding-based similarity (compute embeddings for all extracted questions, cluster via cosine similarity + a distance threshold) — cheaper, faster, good first pass
2. LLM-based refinement pass on borderline clusters for higher accuracy

**Explanation generation prompt**: system prompt instructs the model to (a) prioritize the retrieved study-material chunks provided in context, (b) clearly reason from that material first, (c) supplement with general knowledge only where the material doesn't cover the answer, (d) structure the answer clearly (definition → explanation → example, or however fits the question type).

All LLM calls should request structured JSON output where downstream code needs to parse the result, to avoid brittle text parsing.

## 12. MVP Scope Cut

For the very first working version (to test with the "few classmates/friends" cohort), consider trimming further:
- Single workspace per user (skip multi-workspace management UI)
- Synchronous processing with a loading state (skip background job queue) — acceptable if processing completes in under ~2 minutes
- Embedding-based clustering only (skip LLM refinement pass initially)
- Basic offline caching (cache last-viewed workspace results only, not full history)

## 13. Success Metrics

- **Adoption**: number of workspaces created, files uploaded by test cohort
- **Perceived accuracy**: qualitative feedback — "did the predicted questions match what came up / what you expected?"
- **Engagement**: % of predicted questions where the user opens the detailed explanation
- **Retention signal**: do test users return to the workspace closer to their actual exam date

## 14. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| OCR quality on handwritten/poor-scan past questions | Start with typed/clean scans for MVP; flag low-confidence extractions to the user for manual correction |
| Clustering false positives/negatives (unrelated questions grouped, or true repeats missed) | Allow user to manually merge/split clusters as a feedback loop |
| LLM hallucination in explanations, especially "general knowledge fill-gap" content | Clear labeling of grounding source (Section 6.6); encourage users to verify against their own material |
| Cost scaling with number of LLM calls per workspace | Cache aggressively; batch segmentation calls per file rather than per page where feasible |
| Copyright/IP concerns around past exam papers | These are typically the student's own institution's material for personal study use; avoid redistributing across users/workspaces |

## 15. Roadmap (Post-MVP)

- Multi-workspace management, workspace sharing within study groups
- Personalized weak-topic tracking across workspaces/semesters
- Practice mode: quiz-style self-testing against predicted questions
- Better difficulty scoring using aggregated (opt-in) user feedback across a course
- Native app wrappers if PWA adoption/usage justifies it
