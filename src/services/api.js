import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor: attach JWT token fresh on every request ──────────────
api.interceptors.request.use(
    (config) => {
        // Always read from localStorage so the token is never stale
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stale token and redirect to login
            localStorage.removeItem('token');
            // Only redirect if not already on an auth page
            const publicPaths = ['/login', '/register', '/verify-otp', '/'];
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
