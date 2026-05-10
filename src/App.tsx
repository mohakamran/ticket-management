import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import AdminTickets from './pages/AdminTickets';
import EmployeeTickets from './pages/EmployeeTickets';
import ManageEmployees from './pages/ManageEmployees';
import { Skeleton } from '@/components/ui/skeleton';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'ADMIN' | 'EMPLOYEE' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            } />

            <Route path="/admin/tickets" element={
              <ProtectedRoute role="ADMIN">
                <AdminTickets />
              </ProtectedRoute>
            } />

            <Route path="/employee/tickets" element={
              <ProtectedRoute role="EMPLOYEE">
                <EmployeeTickets />
              </ProtectedRoute>
            } />

            <Route path="/admin/employees" element={
              <ProtectedRoute role="ADMIN">
                <ManageEmployees />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}
