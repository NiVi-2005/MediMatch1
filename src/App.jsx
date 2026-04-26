import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import LoadingSpinner from './components/common/LoadingSpinner'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import SuperAdminLayout from './pages/superadmin/SuperAdminLayout'
import SADashboard from './pages/superadmin/SADashboard'
import SAPharmacies from './pages/superadmin/SAPharmacies'
import SAMedicines from './pages/superadmin/SAMedicines'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminInventory from './pages/admin/AdminInventory'
import AdminMedicines from './pages/admin/AdminMedicines'
import AdminReservations from './pages/admin/AdminReservations'

import UserLayout from './pages/user/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import UserSearch from './pages/user/UserSearch'
import UserReservations from './pages/user/UserReservations'

import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage text="Loading MedConnect..." />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage text="Loading..." />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/user" replace />
}

const pageStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', height: '100vh', gap: 16, background: '#f8fafc',
  padding: '20px',
}

function NotFound() {
  const { t } = useLanguage()
  return (
    <div style={pageStyle}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#e2e8f0', fontFamily: 'Merriweather, serif' }}>404</div>
      <h2 style={{ color: '#334155', fontSize: 22 }}>{t('pageNotFound')}</h2>
      <p style={{ color: '#94a3b8', textAlign: 'center' }}>{t('pageNotFoundMsg')}</p>
      <a href="/" style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: 'white', padding: '11px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>{t('goHome')}</a>
    </div>
  )
}

function Unauthorized() {
  const { t } = useLanguage()
  return (
    <div style={pageStyle}>
      <div style={{ fontSize: 60 }}>🚫</div>
      <h2 style={{ color: '#334155', fontSize: 22 }}>{t('accessDenied')}</h2>
      <p style={{ color: '#94a3b8', textAlign: 'center' }}>{t('noPermission')}</p>
      <a href="/" style={{ background: '#f1f5f9', color: '#475569', padding: '11px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>{t('goBack')}</a>
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: { fontFamily: 'Nunito, sans-serif', fontSize: '14px', borderRadius: '12px', padding: '12px 18px', maxWidth: '360px' },
        success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminLayout /></ProtectedRoute>}>
          <Route index element={<SADashboard />} />
          <Route path="pharmacies" element={<SAPharmacies />} />
          <Route path="medicines" element={<SAMedicines />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="medicines" element={<AdminMedicines />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><UserLayout /></ProtectedRoute>}>
          <Route index element={<UserDashboard />} />
          <Route path="search" element={<UserSearch />} />
          <Route path="reservations" element={<UserReservations />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
