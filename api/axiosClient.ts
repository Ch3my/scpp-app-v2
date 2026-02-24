import axios from 'axios';

// Module-level token storage (accessible outside React)
let currentSessionHash: string | null = null;

export const setSessionHash = (hash: string | null): void => {
    currentSessionHash = hash;
};

export const getSessionHash = (): string | null => currentSessionHash;

export const API_BASE_URL = 'https://scpp.lezora.cl';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

// Request interceptor - adds Authorization header
apiClient.interceptors.request.use(
    (config) => {
        // Skip auth for login endpoint
        if (config.url === '/login') return config;

        const sessionHash = getSessionHash();
        if (sessionHash) {
            config.headers.Authorization = `Bearer ${sessionHash}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
