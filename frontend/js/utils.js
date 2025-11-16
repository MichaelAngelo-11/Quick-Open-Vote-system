// API Utilities - Helper functions for backend communication

const API_URL = '/api';

/**
 * Make an API request to the backend
 * @param {string} endpoint - API endpoint (e.g., '/sessions')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} Response data as JSON
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * API methods object
 * Makes HTTP requests simpler
 */
const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response data
   */
  get: (endpoint) => {
    return fetchAPI(endpoint, { method: 'GET' });
  },
  
  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Data to send in request body
   * @returns {Promise} Response data
   */
  post: (endpoint, data) => {
    return fetchAPI(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Data to send in request body
   * @returns {Promise} Response data
   */
  put: (endpoint, data) => {
    return fetchAPI(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response data
   */
  delete: (endpoint) => {
    return fetchAPI(endpoint, { method: 'DELETE' });
  },
};

/**
 * Get URL query parameters as an object
 * @returns {object} Object with all query parameters
 */
function getUrlParams() {
  const params = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Basic email validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Focus element after render
 * @param {string} selector - CSS selector for the element
 */
function focusElement(selector) {
  setTimeout(() => {
    const el = document.querySelector(selector);
    if (el) el.focus();
  }, 0);
}

// Make utils available globally
window.utils = {
  api,
  getUrlParams,
  isValidEmail,
  focusElement,
};
