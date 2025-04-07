/**
 * API service to handle all requests to the backend
 */

// Base URL for API requests
const API_BASE_URL = '';  // Empty string for relative URLs

/**
 * Make a request to the API
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - API endpoint
 * @param {object} data - Request body for POST, PUT requests
 * @param {object} headers - Additional headers to include in the request
 * @returns {Promise} - Response from the API
 */
export async function apiRequest(method, url, data = undefined, headers = {}) {
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include', // Include cookies in requests
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);

  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || `HTTP error ${response.status}`;
    } catch (e) {
      errorMessage = `HTTP error ${response.status}`;
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  // For other successful responses, parse JSON
  return response;
}

/**
 * GET request wrapper
 * @param {string} url - API endpoint
 * @param {object} headers - Additional headers
 * @returns {Promise} - Response data
 */
export function get(url, headers = {}) {
  return apiRequest('GET', url, undefined, headers);
}

/**
 * POST request wrapper
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} headers - Additional headers
 * @returns {Promise} - Response data
 */
export function post(url, data, headers = {}) {
  return apiRequest('POST', url, data, headers);
}

/**
 * PUT request wrapper
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} headers - Additional headers
 * @returns {Promise} - Response data
 */
export function put(url, data, headers = {}) {
  return apiRequest('PUT', url, data, headers);
}

/**
 * PATCH request wrapper
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} headers - Additional headers
 * @returns {Promise} - Response data
 */
export function patch(url, data, headers = {}) {
  return apiRequest('PATCH', url, data, headers);
}

/**
 * DELETE request wrapper
 * @param {string} url - API endpoint
 * @param {object} headers - Additional headers
 * @returns {Promise} - Response data
 */
export function del(url, headers = {}) {
  return apiRequest('DELETE', url, undefined, headers);
}

/**
 * Upload a file
 * @param {string} url - API endpoint
 * @param {File} file - File to upload
 * @param {string} fieldName - Name of the form field
 * @param {object} additionalData - Additional form data
 * @returns {Promise} - Response data
 */
export async function uploadFile(url, file, fieldName = 'file', additionalData = {}) {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Add any additional data to the form
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
