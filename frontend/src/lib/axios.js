import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Optionally add interceptors here to handle auth tokens later
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const apiKeysStr = localStorage.getItem('gemini_api_keys');
    if (apiKeysStr) {
        try {
            const keys = JSON.parse(apiKeysStr);
            if (Array.isArray(keys) && keys.length > 0) {
                config.headers['X-Gemini-Api-Key'] = keys[0];
            }
        } catch (e) {
            config.headers['X-Gemini-Api-Key'] = apiKeysStr;
        }
    }

    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    config.headers['X-Gemini-Model'] = model;

    return config;
});

export default api;
// Re-trig build 

