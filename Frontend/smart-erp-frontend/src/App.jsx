import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CategoryManagement from './pages/CategoryManagement';
import CustomerManagement from './pages/CustomerManagement';
import Orders from './pages/Orders';
import Reporting from './pages/Reporting';
import UserManagement from './pages/UserManagement';
import BankManagement from './pages/BankManagement';
// ✅ New Page Import
import RolesPermissions from './pages/RolesPermissions'; 
import ExpenseManagement from './pages/ExpenseManagement';

// ✅ Protected Route: Wahi logic jo aapne provide ki
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  
  if (adminOnly && userRole !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* All Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        
        {/* ✅ Naya Expense Route Add Kiya */}
        <Route path="/expenses" element={<ProtectedRoute><ExpenseManagement /></ProtectedRoute>} />
        
        {/* Admin Only Routes */}
        <Route path="/reporting" element={<ProtectedRoute adminOnly={true}><Reporting /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly={true}><UserManagement /></ProtectedRoute>} />
        <Route path="/bank" element={<ProtectedRoute adminOnly={true}><BankManagement /></ProtectedRoute>} />
        
        {/* ✅ Updated Roles Route */}
        <Route 
          path="/roles" 
          element={
            <ProtectedRoute adminOnly={true}>
              <RolesPermissions />
            </ProtectedRoute>
          } 
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;