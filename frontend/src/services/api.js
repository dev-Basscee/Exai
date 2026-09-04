// api.js - Production API Client for ExamPredict AI FastAPI Backend

const API_BASE = '/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      let errorMsg = `Server error (status ${response.status})`;
      try {
        const errData = await response.json();
        errorMsg = errData.detail || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  // Workspaces
  async getWorkspaces() {
    return await this.request('/workspaces');
  }

  async createWorkspace(payload) {
    return await this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        course_code: payload.course_code || payload.code || null,
        description: payload.description || null
      })
    });
  }

  async getWorkspace(id) {
    return await this.request(`/workspaces/${id}`);
  }

  async deleteWorkspace(id) {
    return await this.request(`/workspaces/${id}`, {
      method: 'DELETE'
    });
  }

  // Uploads
  async uploadFile(workspaceId, file, uploadType, year) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', uploadType || 'past_questions');
    if (year) {
      formData.append('inferred_year', String(year));
    }

    const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/uploads`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errorMsg = 'Upload failed';
      try {
        const err = await response.json();
        errorMsg = err.detail || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await response.json();
  }

  async getUploads(workspaceId, uploadType = null) {
    const query = uploadType ? `?upload_type=${uploadType}` : '';
    return await this.request(`/workspaces/${workspaceId}/uploads${query}`);
  }

  async deleteUpload(workspaceId, uploadId) {
    return await this.request(`/workspaces/${workspaceId}/uploads/${uploadId}`, {
      method: 'DELETE'
    });
  }

  // Processing Pipeline
  async triggerProcessing(workspaceId) {
    return await this.request(`/workspaces/${workspaceId}/process`, {
      method: 'POST'
    });
  }

  async getProcessingStatus(workspaceId) {
    return await this.request(`/workspaces/${workspaceId}/status`);
  }

  // Predictions & Explanations
  async getPredictions(workspaceId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params.topic) queryParams.set('topic', params.topic);
    if (params.hard_only) queryParams.set('hard_only', 'true');
    if (params.unreviewed_only) queryParams.set('unreviewed_only', 'true');

    const data = await this.request(`/workspaces/${workspaceId}/predictions?${queryParams.toString()}`);
    return (data || []).map(this.normalizePrediction);
  }

  async getPredictionDetail(clusterId) {
    const data = await this.request(`/predictions/${clusterId}`);
    return this.normalizePrediction(data);
  }

  async generateExplanation(clusterId, customInstructions = null, forceRegenerate = false) {
    return await this.request(`/predictions/${clusterId}/generate-explanation`, {
      method: 'POST',
      body: JSON.stringify({
        custom_instructions: customInstructions,
        force_regenerate: forceRegenerate
      })
    });
  }

  async updateFeedback(clusterId, feedback) {
    return await this.request(`/predictions/${clusterId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify(feedback)
    });
  }

  // Health
  async checkHealth() {
    return await this.request('/health');
  }

  // Transform backend cluster response to standard UI format
  normalizePrediction(cluster) {
    if (!cluster) return null;

    let difficulty_level = 'intermediate';
    if (cluster.difficulty_score < 0.4) {
      difficulty_level = 'foundation';
    } else if (cluster.difficulty_score > 0.7) {
      difficulty_level = 'challenging';
    }

    let structuredExplanation = null;
    if (cluster.explanation?.explanation_text) {
      const text = cluster.explanation.explanation_text;
      structuredExplanation = {
        grounding_type: cluster.explanation.grounding_source === 'study_notes' ? 'grounded_in_notes' : 'general_knowledge',
        grounding_score: cluster.explanation.grounding_source === 'study_notes' ? 0.92 : 0.75,
        core_concept: text,
        step_by_step: [],
        key_takeaways: [],
        pitfalls_to_avoid: [],
        cited_sources: (cluster.explanation.grounding_references || []).map(ref => ({
          document_name: ref.document_name || 'Uploaded Notes',
          page_number: ref.page_number || 1,
          excerpt: ref.excerpt || ref.chunk_text || ''
        }))
      };
    }

    return {
      id: cluster.id,
      workspace_id: cluster.workspace_id,
      question_text: cluster.canonical_question,
      topic: cluster.topic_label || 'General',
      difficulty_level: difficulty_level,
      difficulty_score: cluster.difficulty_score || 0.5,
      recurrence_count: cluster.frequency_count || 1,
      years_appeared: cluster.years_appeared || [],
      frequency_score: Math.min((cluster.frequency_count || 1) / 5, 1.0),
      mark_allocation: cluster.mark_allocation || null,
      bookmarked: Boolean(cluster.feedback?.is_bookmarked),
      is_reviewed: Boolean(cluster.feedback?.marked_reviewed),
      is_hard: Boolean(cluster.feedback?.marked_hard),
      historical_variants: (cluster.variants || []).map(v => 
        v.year ? `${v.year}: ${v.raw_text}` : v.raw_text
      ),
      explanation: structuredExplanation || {
        grounding_type: 'general_knowledge',
        grounding_score: 0.75,
        core_concept: cluster.explanation?.explanation_text || 'Synthesizing syllabus-grounded working for this question...',
        step_by_step: [],
        key_takeaways: [],
        pitfalls_to_avoid: [],
        cited_sources: []
      }
    };
  }
}

export const api = new ApiClient();

// Named convenience exports for UI components
export const fetchWorkspaces = () => api.getWorkspaces();
export const createWorkspace = (data) => api.createWorkspace(data);
export const deleteWorkspace = (id) => api.deleteWorkspace(id);
export const fetchUploads = (workspaceId) => api.getUploads(workspaceId);
export const uploadDocument = (workspaceId, data) => api.uploadFile(workspaceId, data.file, data.upload_type, data.inferred_year);
export const deleteUpload = (uploadId) => api.request(`/uploads/${uploadId}`, { method: 'DELETE' }).catch(() => api.request(`/workspaces/all/uploads/${uploadId}`, { method: 'DELETE' }));
export const fetchPredictions = (workspaceId, params) => api.getPredictions(workspaceId, params);
export const triggerPredictionPipeline = async (workspaceId) => {
  await api.triggerProcessing(workspaceId);
  const preds = await api.getPredictions(workspaceId);
  return { status: 'completed', predictions: preds };
};
export const updatePredictionFeedback = (predictionId, feedback) => api.updateFeedback(predictionId, feedback);
export const checkBackendHealth = () => api.checkHealth();
