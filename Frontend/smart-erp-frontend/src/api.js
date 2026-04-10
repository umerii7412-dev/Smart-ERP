import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5287/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor for Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor for Response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

// --- Admin Control Functions ---
export const getAllUsers = () => api.get('/Admin/GetAllUsers');
export const toggleUserStatus = (id) => api.post(`/Admin/ToggleUserStatus/${id}`);
export const updateUserRole = (data) => api.post('/Admin/UpdateUserRole', data);

// ✅ Grant Permission Endpoints
export const getUserPermissions = (userId) => api.get(`/Admin/GetUserPermissions/${userId}`);
export const assignUserPermissions = (data) => api.post('/Admin/AssignUserPermissions', data);

// ✅ Roles & Permissions Endpoints (UPDATED)
export const getUsersWithRoles = () => api.get('/Role/users-with-roles');
export const getAllBaseRoles = () => api.get('/Role');
export const createRole = (roleData) => api.post('/Role', roleData);

// 🛑 ADDED: Role delete karne ke liye endpoint
export const deleteRole = (id) => api.delete(`/Role/${id}`);

// 🛑 ADDED: Role update karne ke liye endpoint (agar zaroorat paray)
export const updateRole = (id, roleData) => api.put(`/Role/${id}`, roleData);


// ✅ User CRUD Endpoints
export const createUser = (userData) => api.post('/Auth/register', userData); 
export const updateUser = (id, userData) => api.put(`/Admin/UpdateUser/${id}`, userData); 
export const deleteUser = (id) => api.delete(`/Admin/DeleteUser/${id}`);


// --- Auth Functions ---
export const registerUser = (userData) => api.post('/Auth/register', userData); 

// --- Bank & Transactions ---
export const getBanks = () => api.get('/Bank');
export const addBank = (data) => api.post('/Bank', data);
export const addTransaction = (data) => api.post('/Bank/AddTransaction', data);
export const getTransactions = () => api.get('/Bank/Transactions');

// --- Customer Functions ---
export const getCustomers = () => api.get('/Customers');
export const addCustomer = (customerData) => api.post('/Customers', customerData);
export const deleteCustomer = (id) => api.delete(`/Customers/${id}`);

// --- Inventory ---
export const getInventory = () => api.get('/Inventory');

export default api;