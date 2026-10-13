import { CONFIG } from './config';
import { mockRequest } from './mockServer';

let currentToken = null;
let onUnauthorized = null;

export const setToken = (t) => { currentToken = t; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, body) {
  try {
    if (CONFIG.USE_MOCK) return await mockRequest(method, path, body, currentToken);
    const res = await fetch(`${CONFIG.BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.message || 'Error de servidor'), { status: res.status });
    return data;
  } catch (e) {
    if (e.status === 401 && path !== '/auth/login') onUnauthorized?.();
    throw e;
  }
}

export const api = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (data) => request('POST', '/auth/register', data),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),
  changePassword: (currentPassword, newPassword) => request('POST', '/auth/change-password', { currentPassword, newPassword }),
  validateSession: () => request('GET', '/auth/validate'),
  getProfile: () => request('GET', '/me'),
  updateProfile: (data) => request('PUT', '/me', data),
  getMetrics: () => request('GET', '/dashboard/metrics'),
  getProjects: () => request('GET', '/projects'),
  getProject: (id) => request('GET', `/projects/${id}`),
  createProject: (data) => request('POST', '/projects', data),
  getTasks: (projectId) => request('GET', `/projects/${projectId}/tasks`),
  getTask: (id) => request('GET', `/tasks/${id}`),
  setTaskStatus: (id, status) => request('PATCH', `/tasks/${id}/status`, { status }),
  getMessages: (projectId) => request('GET', `/projects/${projectId}/messages`),
  sendMessage: (projectId, text) => request('POST', `/projects/${projectId}/messages`, { text }),
  getNotifications: () => request('GET', '/notifications'),
};
