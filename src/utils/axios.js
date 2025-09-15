import axios from 'axios';

// Set this to true in the browser console to see debug logs
window.FINAURIAL_DEBUG = false;

const log = (...args) => {
  if (window.FINAURIAL_DEBUG) {
    console.log(...args);
  }
};

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api',
  timeout: 10000, // Increased timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      log('Request sent with auth token.');
    } else {
      log('Request sent without auth token.');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
instance.interceptors.response.use(
  (response) => {
    log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      log('Request canceled:', error.message);
      return Promise.reject(error);
    }

    const { response } = error;
    if (response) {
      log('API Error:', response.status, response.data);
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // The UI can decide how to handle this structured error.
        // For admin/feature flags, this allows a graceful fallback.
        console.warn('Unauthorized access (401). Token might be invalid or expired.');
        // We don't redirect here to avoid global UI disruption.
        // Components should handle this error.
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error: No response received.', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Axios setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Attach static methods for external use
instance.isCancel = axios.isCancel;
instance.CancelToken = axios.CancelToken;

export default instance;
