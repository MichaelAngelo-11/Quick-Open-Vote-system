// Helper functions for communicating with the backend API

const API_URL = '/api';

/**
 * Send a request to the API
 * @param {string} endpoint - The endpoint path (e.g., '/sessions')
 * @param {object} options - Fetch options like method, body, headers, etc.
 * @returns {Promise} JSON response from the server
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
 * Convenient wrapper for common HTTP methods
 */
const api = {
    /**
     * Fetch data from an endpoint
     * @param {string} endpoint - Target endpoint
     * @returns {Promise} Server response
     */
    get: (endpoint) => {
        return fetchAPI(endpoint, {method: 'GET'});
    },

    /**
     * Send new data to the server
     * @param {string} endpoint - Target endpoint
     * @param {object} data - Payload to send
     * @returns {Promise} Server response
     */
    post: (endpoint, data) => {
        return fetchAPI(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update existing data
     * @param {string} endpoint - Target endpoint
     * @param {object} data - Updated data
     * @returns {Promise} Server response
     */
    put: (endpoint, data) => {
        return fetchAPI(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Remove data from the server
     * @param {string} endpoint - Target endpoint
     * @returns {Promise} Server response
     */
    delete: (endpoint) => {
        return fetchAPI(endpoint, {method: 'DELETE'});
    },
};

/**
 * Extract query string parameters from the current URL
 * @returns {object} Key-value pairs of query parameters
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
 * Check if an email address looks valid
 * @param {string} email - The email to check
 * @returns {boolean} Whether it matches a basic email pattern
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Set focus on an element with a slight delay
 * @param {string} selector - CSS selector to target
 */
function focusElement(selector) {
    setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) el.focus();
    }, 0);
}

// Export utilities to the global scope
window.utils = {
    api,
    getUrlParams,
    isValidEmail,
    focusElement,
};
