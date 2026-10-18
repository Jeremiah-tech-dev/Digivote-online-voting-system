import { API_URL } from './config';

// Turn any FastAPI error body into a readable message.
// Validation errors (422) come back as a list like
// [{ loc: ['body', 'nationalId'], msg: 'Value error, National ID must be 7 or 8 digits' }]
const getErrorMessage = (data, fallback) => {
  if (!data || !data.detail) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err) => (err.msg || '').replace(/^Value error, /, ''))
      .filter(Boolean)
      .join('\n') || fallback;
  }
  return fallback;
};

// Call the backend. Throws an Error with a user-friendly message on failure.
export const apiRequest = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch (networkError) {
    throw new Error('Error connecting to server');
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    // Empty or non-JSON response
  }

  if (!response.ok) {
    const error = new Error(getErrorMessage(data, `Request failed (${response.status})`));
    error.status = response.status;
    throw error;
  }

  return data;
};
