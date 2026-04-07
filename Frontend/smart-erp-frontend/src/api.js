import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7046/api', 
});

// Interceptor for Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Admin Control Functions (Naye add kiye gaye hain)
export const getAllUsers = () => api.get('/Admin/GetAllUsers');
export const toggleUserStatus = (id) => api.post(`/Admin/ToggleUserStatus/${id}`);
export const updateUserRole = (data) => api.post('/Admin/UpdateUserRole', data);

// ADDED: Register User function for the 'Add New User' modal
export const registerUser = (userData) => api.post('/Auth/register', userData); 

export const getBanks = () => api.get('/Bank');
export const addBank = (data) => api.post('/Bank', data); // Naya bank add karne ke liye
export const addTransaction = (data) => api.post('/Bank/AddTransaction', data);
export const getTransactions = () => api.get('/Bank/Transactions');

export default api;