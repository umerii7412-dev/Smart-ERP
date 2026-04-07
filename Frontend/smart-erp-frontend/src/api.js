import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7046/api', // Apna .NET Port check kar lein (Swagger se)
});

// Har request ke sath Token bhejne ke liye Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;