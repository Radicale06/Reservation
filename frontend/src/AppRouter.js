import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// User Components
import App from './App';

// Admin Components
import AdminLogin from './admin/pages/Login';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Reservations from './admin/pages/Reservations';
import Courts from './admin/pages/Courts';
import Settings from './admin/pages/Settings';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Import admin styles
import './admin/styles/AdminLayout.css';
import './admin/styles/Dashboard.css';
import './admin/styles/AdminPages.css';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* User Interface Routes */}
        <Route path="/" element={<App />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="courts" element={<Courts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;