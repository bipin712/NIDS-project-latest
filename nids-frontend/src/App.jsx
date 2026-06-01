import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';

// Pages (placeholders for now, we'll implement them next)
const Placeholder = ({ name }) => <div className="p-4 bg-white rounded border border-[#e0e4e8]">Placeholder for {name}</div>;

const AdminRegister = () => <Placeholder name="Admin Register" />;

const Dashboard = () => <Placeholder name="Dashboard" />;
const Alerts = () => <Placeholder name="Alerts" />;
const Historical = () => <Placeholder name="Historical" />;
const Reports = () => <Placeholder name="Reports" />;
const Settings = () => <Placeholder name="Settings" />;
const Profile = () => <Placeholder name="Profile" />;

const AdminDashboard = () => <Placeholder name="Admin Dashboard" />;
const AdminUsers = () => <Placeholder name="Admin Users" />;

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin-dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) return <Navigate to="/admin-login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (user) {
    return <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/historical" element={<Historical />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsers />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
