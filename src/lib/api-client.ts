/**
 * API Client Helper - Cliente para llamadas API autenticadas
 * 
 * Proporciona funciones helper para hacer llamadas API con autenticación
 */

// Obtener token de autenticación desde localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth-token');
  
  // DEVELOPMENT: Si no hay token y estamos en desarrollo, usar mock-token
  if (!token && process.env.NODE_ENV === 'development') {
    return 'mock-token';
  }
  
  return token;
}

// Crear headers con autenticación
function createAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Helper para procesar respuestas JSON de forma segura
async function processJsonResponse(response: Response, url: string): Promise<any> {
  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text) {
      return null; // Empty response
    }
    throw new Error(`Expected JSON response, got: ${contentType}`);
  }
  
  // Safely parse JSON
  try {
    const text = await response.text();
    if (!text.trim()) {
      return null; // Empty response body
    }
    return JSON.parse(text);
  } catch (jsonError) {
    throw new Error(`Invalid JSON response from ${url}: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON parse error'}`);
  }
}

// Wrapper para fetch con autenticación
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = createAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });
}

// Helper para GET requests
export async function apiGet(url: string): Promise<any> {
  try {
    const response = await authenticatedFetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await processJsonResponse(response, url);
  } catch (error) {
    // Handle network errors, JSON parse errors, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to fetch from ${url}. Check your internet connection.`);
    }
    throw error;
  }
}

// Helper para POST requests
export async function apiPost(url: string, data: any): Promise<any> {
  try {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await processJsonResponse(response, url);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to post to ${url}. Check your internet connection.`);
    }
    throw error;
  }
}

// Helper para upload de archivos (FormData)
export async function apiUpload(url: string, formData: FormData): Promise<any> {
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // No establecer Content-Type para FormData, el browser lo hará automáticamente

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await processJsonResponse(response, url);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to upload to ${url}. Check your internet connection.`);
    }
    throw error;
  }
}

// Helper para PUT requests
export async function apiPut(url: string, data: any): Promise<any> {
  try {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await processJsonResponse(response, url);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to update ${url}. Check your internet connection.`);
    }
    throw error;
  }
}

// Helper para DELETE requests
export async function apiDelete(url: string): Promise<any> {
  try {
    const response = await authenticatedFetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    // DELETE operations might return empty responses (204 No Content)
    if (response.status === 204) {
      return null; // No content response is valid for DELETE
    }
    
    return await processJsonResponse(response, url);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to delete from ${url}. Check your internet connection.`);
    }
    throw error;
  }
}

export default {
  get: apiGet,
  post: apiPost,
  upload: apiUpload,
  put: apiPut,
  delete: apiDelete,
  fetch: authenticatedFetch
};