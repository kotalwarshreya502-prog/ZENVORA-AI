import axios from 'axios';

/**
 * ZENVORA AI - Centralized Axios API Service
 * Base URL defaults to /api (proxied by Vite to port 5000) or VITE_API_URL
 */
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zenvora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Flatten payload & handle error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorDetails = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || null,
      data: error.response?.data || null,
    };
    return Promise.reject(errorDetails);
  }
);

export const api = {
  // System Health
  getHealth: () => apiClient.get('/health'),

  // Authentication
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),

  // AI Content Engine
  generateContent: (data) => apiClient.post('/ai/generate', data),
  generateBlog: (data) => apiClient.post('/ai/blog', data),
  generateCaptions: (data) => apiClient.post('/ai/captions', data),
  generateHashtags: (data) => apiClient.post('/ai/hashtags', data),

  // Marketing Campaigns
  getCampaigns: () => apiClient.get('/campaigns'),
  createCampaign: (data) => apiClient.post('/campaigns', data),
  updateCampaign: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  deleteCampaign: (id) => apiClient.delete(`/campaigns/${id}`),

  // Posts & Captions
  getPosts: (params) => apiClient.get('/posts', { params }),
  createPost: (data) => apiClient.post('/posts', data),
  updatePost: (id, data) => apiClient.put(`/posts/${id}`, data),
  deletePost: (id) => apiClient.delete(`/posts/${id}`),

  // Blogs
  getBlogs: () => apiClient.get('/blogs'),
  getBlogById: (id) => apiClient.get(`/blogs/${id}`),
  createBlog: (data) => apiClient.post('/blogs', data),
  updateBlog: (id, data) => apiClient.put(`/blogs/${id}`, data),
  deleteBlog: (id) => apiClient.delete(`/blogs/${id}`),

  // Brand Knowledge Base
  getBrandGuidelines: () => apiClient.get('/brand'),
  updateBrandGuidelines: (data) => apiClient.put('/brand', data),

  // SEO Audit & Heuristics
  analyzeSeo: (data) => apiClient.post('/seo/analyze', data),

  // Marketing Analytics
  getAnalytics: () => apiClient.get('/analytics'),

  // Calendar
  getCalendarEvents: () => apiClient.get('/calendar'),
  scheduleCalendarEvent: (data) => apiClient.post('/calendar/schedule', data),

  // Business Profile
  getBusinessProfile: () => apiClient.get('/business'),
  updateBusinessProfile: (data) => apiClient.put('/business', data),

  // Social Integrations
  getIntegrations: () => apiClient.get('/integrations'),
  toggleIntegration: (id, action) => apiClient.post(`/integrations/${id}/toggle`, { action }),

  // Notifications
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationsRead: () => apiClient.post('/notifications/mark-read'),

  // Subscriptions & Billing
  getSubscription: () => apiClient.get('/subscriptions'),
  upgradePlan: (data) => apiClient.post('/subscriptions/upgrade', data),

  // ── NEW: Research Assistant ──────────────────────────────────────────────
  analyzeResearch: (data) => apiClient.post('/research/analyze', data),

  // ── NEW: Competitor Analysis ─────────────────────────────────────────────
  analyzeCompetitor: (data) => apiClient.post('/competitor/analyze', data),

  // ── NEW: Image / Poster Generation (Pollinations.ai) ────────────────────
  generatePosterImage: (data) => apiClient.post('/image/generate', data),
  generateSocialGraphic: (data) => apiClient.post('/image/social', data),

  // ── NEW: Generation History ──────────────────────────────────────────────
  getHistory: (params) => apiClient.get('/history', { params }),
  saveHistoryItem: (id, data) => apiClient.patch(`/history/${id}/save`, data),
  deleteHistoryItem: (id) => apiClient.delete(`/history/${id}`),
};

export default apiClient;
