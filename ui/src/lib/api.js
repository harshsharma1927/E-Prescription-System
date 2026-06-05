const LOCAL_DEV_API_URL = 'http://localhost:5000/api';

function readEnv(key) {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

/**
 * Resolves the backend API base URL (must include the /api prefix).
 * Priority: VITE_API_URL → VITE_API_BASE_URL → REACT_APP_API_URL → local default.
 *
 * Set at build time for AWS (CodeBuild, Docker build-arg, Amplify, etc.):
 *   VITE_API_URL=https://api.your-domain.com/api
 */
export function getApiBaseUrl() {
  const raw =
    readEnv('VITE_API_URL') ||
    readEnv('VITE_API_BASE_URL') ||
    readEnv('REACT_APP_API_URL') ||
    LOCAL_DEV_API_URL;

  return raw.replace(/\/+$/, '');
}

export function apiUrl(path, baseUrl) {
  const base = (baseUrl || getApiBaseUrl()).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function apiRequest({ path, method = 'GET', token, body, baseUrl }) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(apiUrl(path, baseUrl), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const err = new Error(payload?.message || 'Request failed');
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
