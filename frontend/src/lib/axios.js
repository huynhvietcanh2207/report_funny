import axios from 'axios';
import { toRaw } from 'vue';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (window.location.origin + '/api'),
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Optionally add interceptors here to handle auth tokens later
api.interceptors.request.use(config => {
    // Detach headers from Vue reactivity to prevent infinite loops in Axios 1.x
    const headers = toRaw(config.headers);
    const token = localStorage.getItem('token');
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const apiKeysStr = localStorage.getItem('gemini_api_keys');
    if (apiKeysStr) {
        try {
            const keys = JSON.parse(apiKeysStr);
            if (Array.isArray(keys) && keys.length > 0) {
                headers.set('X-Gemini-Api-Key', keys[0]);
            }
        } catch (e) {
            headers.set('X-Gemini-Api-Key', apiKeysStr);
        }
    }

    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    headers.set('X-Gemini-Model', model);

    return config;
});

export default api;
// Re-trig build 

