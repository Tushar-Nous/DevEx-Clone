/**
 * API Configuration
 * Centralized API endpoint configuration for development and production
 */

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'production';

// API Base URLs
const API_URLS = {
  development: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  production: 'https://devexapi-h9enh0akfxaygwas.eastus2-01.azurewebsites.net'
};

// Export the appropriate API base URL
export const API_BASE_URL = isDevelopment ? API_URLS.development : API_URLS.production;

// API Endpoints
export const API_ENDPOINTS = {
  // Guidelines
  generateGuidelines: `${API_BASE_URL}/generate-guidelines`,
  getGuidelines: `${API_BASE_URL}/get-guidelines`,
  getGuidelineById: (id) => `${API_BASE_URL}/get-guidelines/${id}`,
  
  // Agile Artifacts
  generateAgileArtifacts: `${API_BASE_URL}/generate-agile-artifacts`,
  getAgileArtifacts: `${API_BASE_URL}/get-agile-artifacts`,
  getAgileArtifactById: (id) => `${API_BASE_URL}/get-agile-artifacts/${id}`,
  
  // Backend Projects
  backendProjects: `${API_BASE_URL}/backend-projects`,
  backendProjectById: (id) => `${API_BASE_URL}/backend-projects/${id}`,
  backendProjectByName: (name) => `${API_BASE_URL}/backend-projects/project/${name}`,
  recentBackendProject: `${API_BASE_URL}/backend-projects/recent`,
  
  // Personas
  personas: `${API_BASE_URL}/personas`,
  personaById: (id) => `${API_BASE_URL}/personas/${id}`,
  personaStats: `${API_BASE_URL}/personas/stats/usage`,
  
  // Health
  health: `${API_BASE_URL}/health`
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Log current API configuration
console.log('🔌 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  baseURL: API_BASE_URL,
  endpoints: Object.keys(API_ENDPOINTS).length
});

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl,
  isDevelopment,
  isProduction
};
