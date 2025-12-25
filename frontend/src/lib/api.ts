import Cookies from 'js-cookie';

const BASE_URL = "http://127.0.0.1:8000/api";

export async function secureFetch(endpoint: string, options: any = {}) {
  let token = Cookies.get('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // If Access Token is expired (401)
if (response.status === 401) {
    // Token is dead! 
    Cookies.remove('access_token');
    
    // Force redirect to login
    window.location.href = '/login?message=Session expired. Please log in again.';
    
  }
  return response; 
}