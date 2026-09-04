-- ==============================================================================
-- ExamPredict AI - Supabase PostgreSQL Schema
-- ==============================================================================
-- You can run this script directly in the Supabase Dashboard -> SQL Editor.
-- It creates all required tables, foreign keys, and indexes for ExamPredict AI.
-- ==============================================================================

-- 1. Workspaces (Course / Subject spaces)
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL DEFAULT 'default_user',
    name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_workspaces_user_id ON workspaces(user_id);

-- 2. Uploads (Uploaded past questions and study materials)
CREATE TABLE IF NOT EXISTS uploads (
    id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_url VARCHAR(512),
    upload_type VARCHAR(50) NOT NULL, -- 'past_questions' | 'study_material'
    inferred_year VARCHAR(50),
    file_size INTEGER NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'processed' | 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_uploads_workspace_id ON uploads(workspace_id);
CREATE INDEX IF NOT EXISTS ix_uploads_upload_type ON uploads(upload_type);

-- 3. Extracted Texts (Per-page parsed text from uploaded files)
CREATE TABLE IF NOT EXISTS extracted_texts (
    id VARCHAR(36) PRIMARY KEY,
    upload_id VARCHAR(36) NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    raw_text TEXT NOT NULL,
    cleaned_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_extracted_texts_upload_id ON extracted_texts(upload_id);

-- 4. Question Clusters (Grouped and deduplicated predicted questions)
CREATE TABLE IF NOT EXISTS question_clusters (
    id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    representative_question_text TEXT NOT NULL,
    frequency_count INTEGER NOT NULL DEFAULT 1,
    years_seen JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["2021", "2022", "2024"]
    difficulty_score FLOAT NOT NULL DEFAULT 3.0,   -- 1.0 (easy) to 5.0 (hard)
    marks_allocated FLOAT,
    topic_label VARCHAR(255),
    composite_score FLOAT NOT NULL DEFAULT 0.0,    -- Ranking priority score
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_question_clusters_workspace_id ON question_clusters(workspace_id);
CREATE INDEX IF NOT EXISTS ix_question_clusters_topic_label ON question_clusters(topic_label);
CREATE INDEX IF NOT EXISTS ix_question_clusters_composite_score ON question_clusters(composite_score DESC);

-- 5. Question Variants (Original question instances belonging to a cluster)
CREATE TABLE IF NOT EXISTS question_variants (
    id VARCHAR(36) PRIMARY KEY,
    cluster_id VARCHAR(36) NOT NULL REFERENCES question_clusters(id) ON DELETE CASCADE,
    upload_id VARCHAR(36) REFERENCES uploads(id) ON DELETE SET NULL,
    original_question_text TEXT NOT NULL,
    year VARCHAR(50),
    page_number INTEGER,
    marks FLOAT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_question_variants_cluster_id ON question_variants(cluster_id);
CREATE INDEX IF NOT EXISTS ix_question_variants_upload_id ON question_variants(upload_id);

-- 6. Explanations (AI generated comprehensive answers and study guides)
CREATE TABLE IF NOT EXISTS explanations (
    id VARCHAR(36) PRIMARY KEY,
    cluster_id VARCHAR(36) NOT NULL UNIQUE REFERENCES question_clusters(id) ON DELETE CASCADE,
    explanation_text TEXT NOT NULL,
    grounding_source VARCHAR(50) NOT NULL DEFAULT 'general_knowledge', -- 'material' | 'mixed' | 'general_knowledge'
    grounding_references JSONB NOT NULL DEFAULT '[]'::jsonb,           -- [{"source": str, "page": int, "snippet": str}]
    model_version VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_explanations_cluster_id ON explanations(cluster_id);

-- 7. User Question Feedback (Bookmarks, Hard flags, Reviewed flags, and notes)
CREATE TABLE IF NOT EXISTS user_question_feedback (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL DEFAULT 'default_user',
    cluster_id VARCHAR(36) NOT NULL REFERENCES question_clusters(id) ON DELETE CASCADE,
    marked_hard BOOLEAN NOT NULL DEFAULT false,
    marked_reviewed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS ix_user_question_feedback_cluster_id ON user_question_feedback(cluster_id);
CREATE INDEX IF NOT EXISTS ix_user_question_feedback_user_id ON user_question_feedback(user_id);

-- 8. Processing Jobs (Background analysis and extraction job tracking)
CREATE TABLE IF NOT EXISTS processing_jobs (
    id VARCHAR(36) PRIMARY KEY,
    workspace_id VARCHAR(36) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    current_step VARCHAR(100) NOT NULL DEFAULT 'idle',
    error_message TEXT,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_processing_jobs_workspace_id ON processing_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS ix_processing_jobs_status ON processing_jobs(status);

-- ==============================================================================
-- Supabase Storage Bucket (Optional)
-- Run this block if you wish to initialize the storage bucket directly in SQL:
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-uploads', 'exam-uploads', false)
ON CONFLICT (id) DO NOTHING;
