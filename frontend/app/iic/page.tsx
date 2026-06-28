const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Check if API is available
export const isApiAvailable = () => {
  return API_URL && API_URL.length > 0;
};

export async function apiCall(
  endpoint: string,
  options?: RequestInit
) {
  // If no API URL configured, throw immediately (graceful fallback to static data)
  if (!API_URL) {
    throw new Error('API not configured - using static data');
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function apiLogin(email: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetProfile() {
  return apiCall('/auth/profile');
}
