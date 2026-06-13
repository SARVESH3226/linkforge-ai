import { useAuthStore } from '../store/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  body?: any;
}

async function request(path: string, options: FetchOptions = {}) {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type to application/json by default unless sending FormData
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle CSV file attachments directly (detect header content disposition)
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/csv')) {
    if (!response.ok) {
      throw new Error('Failed to retrieve CSV document');
    }
    return response.text() as any;
  }

  const data = await response.json().catch(() => ({ success: false, error: 'JSON parsing failed' }));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  get: <T = any>(path: string, options?: FetchOptions): Promise<{ success: boolean; data: T; pagination?: any }> => 
    request(path, { ...options, method: 'GET' }),
  
  post: <T = any>(path: string, body?: any, options?: FetchOptions): Promise<{ success: boolean; data: T }> => 
    request(path, { ...options, method: 'POST', body }),
  
  put: <T = any>(path: string, body?: any, options?: FetchOptions): Promise<{ success: boolean; data: T }> => 
    request(path, { ...options, method: 'PUT', body }),
  
  delete: (path: string, options?: FetchOptions): Promise<{ success: boolean; message?: string }> => 
    request(path, { ...options, method: 'DELETE' }),
};
