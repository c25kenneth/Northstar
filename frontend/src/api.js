import { supabase } from '../supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get current user ID
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  // Get user ID from Supabase auth
  let userId = null;
  try {
    userId = await getUserId();
  } catch (error) {
    console.warn('Could not get user ID:', error);
  }
  
  // Add user_id as query param for GET requests
  let finalEndpoint = endpoint;
  if (userId && (!options.method || options.method === 'GET')) {
    const separator = endpoint.includes('?') ? '&' : '?';
    finalEndpoint = `${endpoint}${separator}user_id=${userId}`;
  }
  
  const url = `${API_URL}${finalEndpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(userId && { 'X-User-ID': userId }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body) {
    // Include user_id in request body if it's a POST/PUT request
    if (userId && (options.method === 'POST' || options.method === 'PUT')) {
      const bodyObj = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      config.body = JSON.stringify({ ...bodyObj, user_id: userId });
    } else {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Try to parse JSON, but handle cases where response might not be JSON
    let data;
    const status = response.status;
    
    try {
      const text = await response.text();
      // Try to parse as JSON, fallback to empty object if not valid JSON
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { detail: text || `HTTP error! status: ${status}` };
        }
      } else {
        data = { detail: `HTTP error! status: ${status}` };
      }
    } catch (jsonError) {
      // If parsing fails entirely, create a basic error object
      data = { detail: `HTTP error! status: ${status}` };
    }

    if (!response.ok) {
      const error = new Error(data.detail || `HTTP error! status: ${status}`);
      // Don't log expected 404 errors (no active repo, no experiment yet, etc.)
      // These are normal states, not errors
      if (status !== 404) {
        console.error('API call failed:', error);
      }
      throw error;
    }

    return data;
  } catch (error) {
    // Only log if it's not a 404 or if it's a network error
    // Network errors don't have a status, so we check the message
    if (error.message && !error.message.includes('404') && error.message !== 'Failed to fetch') {
      console.error('API call failed:', error);
    }
    throw error;
  }
}

// Repository APIs
export const repositoriesAPI = {
  connect: async (repoFullname, defaultBranch = 'main', baseBranch = 'main') => {
    return apiCall('/repositories', {
      method: 'POST',
      body: { repo_fullname: repoFullname, default_branch: defaultBranch, base_branch: baseBranch },
    });
  },

  list: async () => {
    return apiCall('/repositories');
  },

  getActive: async () => {
    return apiCall('/repositories/active');
  },
};

// Proposal APIs
export const proposalsAPI = {
  list: async (status = null, repoId = null) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (repoId) params.append('repo_id', repoId);
    const queryString = params.toString();
    return apiCall(`/proposals${queryString ? `?${queryString}` : ''}`);
  },

  get: async (proposalId) => {
    return apiCall(`/proposals/${proposalId}`);
  },

  approve: async (proposalId, updateBlock) => {
    // Note: OAuth session ID is stored in the proposal, backend will use that
    return apiCall(`/proposals/${proposalId}/approve`, {
      method: 'POST',
      body: { 
        proposal_id: proposalId, 
        update_block: updateBlock
      },
    });
  },

  reject: async (proposalId) => {
    return apiCall(`/proposals/${proposalId}/reject`, {
      method: 'POST',
    });
  },

  propose: async (oauthSessionId, codebaseContext = null) => {
    return apiCall('/northstar/propose', {
      method: 'POST',
      body: { 
        oauth_session_id: oauthSessionId,
        ...(codebaseContext && { codebase_context: codebaseContext })
      },
    });
  },
};

// Experiment APIs
export const experimentsAPI = {
  list: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/experiments${params}`);
  },

  get: async (experimentId) => {
    return apiCall(`/experiments/${experimentId}`);
  },

  getByProposal: async (proposalId) => {
    return apiCall(`/experiments/by-proposal/${proposalId}`);
  },
};

// Activity Logs API
export const activityLogsAPI = {
  list: async (limit = 50) => {
    return apiCall(`/activity-logs?limit=${limit}`);
  },
};

// Slack OAuth API
export const slackAPI = {
  startOAuth: async () => {
    return apiCall('/oauth/start');
  },

  completeOAuth: async (sessionId) => {
    return apiCall(`/oauth/complete?session_id=${sessionId}`);
  },

  sendMessage: async (message, oauthSessionId) => {
    return apiCall('/slack/message', {
      method: 'POST',
      body: { message, oauth_session_id: oauthSessionId },
    });
  },
};

// OAuth session management (localStorage)
export const oauthStorage = {
  getSessionId: () => {
    return localStorage.getItem('slack_oauth_session_id');
  },

  setSessionId: (sessionId) => {
    localStorage.setItem('slack_oauth_session_id', sessionId);
  },

  clearSessionId: () => {
    localStorage.removeItem('slack_oauth_session_id');
  },
};

