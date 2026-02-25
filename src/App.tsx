import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';
import AdminGuard from '@/components/auth/AdminGuard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminLayout from '@/components/admin/AdminLayout';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AuthCallback from '@/components/auth/AuthCallback';

import DashboardHome from '@/pages/dashboard/DashboardHome';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import PetManager from '@/pages/dashboard/PetManager';
import MembershipPage from '@/pages/dashboard/MembershipPage';
import MembershipCard from '@/pages/dashboard/MembershipCard';
import SettingsPage from '@/pages/dashboard/SettingsPage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import WaitlistManager from '@/pages/admin/WaitlistManager';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Authenticated dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="pets" element={<PetManager />} />
        <Route path="membership" element={<MembershipPage />} />
        <Route path="card" element={<MembershipCard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="waitlist" element={<WaitlistManager />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
