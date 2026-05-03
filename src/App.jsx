import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ResidentsPage from './pages/residents/ResidentsPage';
import FinancePage from './pages/finance/FinancePage';
import SettingsPage from './pages/settings/SettingsPage';
import LettersPage from './pages/letters/LettersPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import TenantsPage from './pages/superadmin/TenantsPage';
import BillingPage from './pages/superadmin/BillingPage';
import SupportTicketsPage from './pages/superadmin/SupportTicketsPage';
import MyBills from './pages/residents/MyBills';
import RequestLetter from './pages/residents/RequestLetter';
import ReportRT from './pages/residents/ReportRT';
import ManageReports from './pages/letters/ManageReports';
import VerifyLetter from './pages/public/VerifyLetter';
import Layout from './components/common/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  if (!currentUser) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/announcements" element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          } />

          {/* Placeholder routes for other features */}
          <Route path="/warga" element={
            <ProtectedRoute>
              <ResidentsPage />
            </ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute>
              <FinancePage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/surat" element={
            <ProtectedRoute>
              <LettersPage />
            </ProtectedRoute>
          } />
           <Route path="/my-bills" element={<ProtectedRoute><MyBills /></ProtectedRoute>} />
          <Route path="/request-surat" element={<ProtectedRoute><RequestLetter /></ProtectedRoute>} />
          <Route path="/manage-reports" element={<ProtectedRoute><ManageReports /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportRT /></ProtectedRoute>} />
          <Route path="/tenants" element={
            <ProtectedRoute>
              <TenantsPage />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute>
              <SupportTicketsPage />
            </ProtectedRoute>
          } />

          <Route path="/verify/:id" element={<VerifyLetter />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
