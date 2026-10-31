import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AcademicAudit from './pages/AcademicAudit';
import SkillGap from './pages/SkillGap';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import AdminConfig from './pages/AdminConfig';
import StudentsDirectory from './pages/StudentsDirectory';

// Protected Route Wrapper Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'FACULTY' | 'ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold tracking-wide">Securing connection...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to role-specific homepage
    if (user.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Root Path Redirect Router Helper
const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="h-8 w-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root redirect router */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-audit"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
                <AcademicAudit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
                <SkillGap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty-dashboard"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminConfig />
              </ProtectedRoute>
            }
          />

          {/* Shared Directory Route for Faculty and Admin */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <StudentsDirectory />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
