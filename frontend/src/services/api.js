// API client for ExamPredict AI backend with offline cache fallback

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.cachePrefix = 'exampredict_cache_';
  }

  // LocalStorage Cache helpers
  setCache(key, data) {
    try {
      localStorage.setItem(`${this.cachePrefix}${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('LocalStorage cache write error:', e);
    }
  }

  getCache(key) {
    try {
      const item = localStorage.getItem(`${this.cachePrefix}${key}`);
      if (item) {
        return JSON.parse(item).data;
      }
    } catch (e) {
      console.warn('LocalStorage cache read error:', e);
    }
    return null;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        let errorMsg = `Server returned status ${response.status}`;
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
    } catch (err) {
      // Network failure or server offline
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Workspaces
  async getWorkspaces() {
    try {
      const data = await this.request('/workspaces');
      this.setCache('workspaces', data);
      return { data, fromCache: false };
    } catch (err) {
      const cached = this.getCache('workspaces');
      if (cached) {
        return { data: cached, fromCache: true };
      }
      throw err;
    }
  }

  async createWorkspace(payload) {
    return await this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getWorkspace(id) {
    try {
      const data = await this.request(`/workspaces/${id}`);
      this.setCache(`workspace_${id}`, data);
      return { data, fromCache: false };
    } catch (err) {
      const cached = this.getCache(`workspace_${id}`);
      if (cached) {
        return { data: cached, fromCache: true };
      }
      throw err;
    }
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
    formData.append('upload_type', uploadType);
    if (year) {
      formData.append('inferred_year', year);
    }

    const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/uploads`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
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

    const cacheKey = `predictions_${workspaceId}_${queryParams.toString()}`;

    try {
      const data = await this.request(`/workspaces/${workspaceId}/predictions?${queryParams.toString()}`);
      this.setCache(cacheKey, data);
      return { data, fromCache: false };
    } catch (err) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return { data: cached, fromCache: true };
      }
      throw err;
    }
  }

  async getPredictionDetail(clusterId) {
    return await this.request(`/predictions/${clusterId}`);
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
}

export const api = new ApiClient();
