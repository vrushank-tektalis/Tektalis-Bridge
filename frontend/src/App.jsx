import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjects from './pages/client/ClientProjects';
import NewProject from './pages/client/NewProject';
import ClientProjectDetail from './pages/client/ClientProjectDetail';
import PastProjects from './pages/client/PastProjects';
import ClientNotifications from './pages/client/ClientNotifications';

// Developer Pages
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import AvailableProjects from './pages/developer/AvailableProjects';
import LiveProjects from './pages/developer/LiveProjects';
import DeveloperProjectDetail from './pages/developer/DeveloperProjectDetail';
import ProjectRequests from './pages/developer/ProjectRequests';
import OrgChat from './pages/developer/OrgChat';
import DeveloperPastProjects from './pages/developer/PastProjects';
import DeveloperNotifications from './pages/developer/DeveloperNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientManagement from './pages/admin/ClientManagement';
import DeveloperManagement from './pages/admin/DeveloperManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import AdminProjectDetail from './pages/admin/AdminProjectDetail';
import TaskManagement from './pages/admin/TaskManagement';
import BugManagement from './pages/admin/BugManagement';
import Analytics from './pages/admin/Analytics';
import AdminNotifications from './pages/admin/AdminNotifications';

import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their respective dashboard
    if (user?.role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
    if (user?.role === 'DEVELOPER') return <Navigate to="/developer/dashboard" replace />;
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <WebSocketProvider>{children}</WebSocketProvider>;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  
  if (isAuthenticated) {
    if (user?.role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
    if (user?.role === 'DEVELOPER') return <Navigate to="/developer/dashboard" replace />;
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      </Route>

      {/* Client Routes */}
      <Route path="/client" element={<ProtectedRoute allowedRoles={['CLIENT']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="projects/new" element={<NewProject />} />
        <Route path="projects/:id" element={<ClientProjectDetail />} />
        <Route path="projects/past" element={<PastProjects />} />
        <Route path="notifications" element={<ClientNotifications />} />
      </Route>

      {/* Developer Routes */}
      <Route path="/developer" element={<ProtectedRoute allowedRoles={['DEVELOPER']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="projects/available" element={<AvailableProjects />} />
        <Route path="projects/live" element={<LiveProjects />} />
        <Route path="projects/:id" element={<DeveloperProjectDetail />} />
        <Route path="requests" element={<ProjectRequests />} />
        <Route path="chat" element={<OrgChat />} />
        <Route path="projects/past" element={<DeveloperPastProjects />} />
        <Route path="notifications" element={<DeveloperNotifications />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="clients" element={<ClientManagement />} />
        <Route path="developers" element={<DeveloperManagement />} />
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="projects/:id" element={<AdminProjectDetail />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="bugs" element={<BugManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
