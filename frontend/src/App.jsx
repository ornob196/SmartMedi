// ─── Main App Router ──────────────────────────────────────────────────────────
// Defines all routes for SMARTMEDI.
// Includes: Public routes, Protected patient routes, Protected doctor routes,
//           Admin routes, Forgot/Reset password, Chat, Reports, Admin panel.

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'

// ── Public Pages ──────────────────────────────────────────────────────────────
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AboutPage from './pages/AboutPage'
import DoctorsPage from './pages/DoctorsPage'
import ContactPage from './pages/ContactPage'
import EmergencyPage from './pages/EmergencyPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'

// ── Patient Pages ─────────────────────────────────────────────────────────────
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import PatientPrescriptions from './pages/patient/PatientPrescriptions'
import PatientReports from './pages/patient/PatientReports'
import PatientChat from './pages/patient/PatientChat'
import PatientProfile from './pages/patient/PatientProfile'

// ── Doctor Pages ──────────────────────────────────────────────────────────────
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import MakePrescription from './pages/doctor/MakePrescription'
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions'
import DoctorChat from './pages/doctor/DoctorChat'
import DoctorProfile from './pages/doctor/DoctorProfile'

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminPanel from './pages/admin/AdminPanel'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminPatients from './pages/admin/AdminPatients'
import AdminAppointments from './pages/admin/AdminAppointments'

// ─────────────────────────────────────────────────────────────────────────────
// Protected Route Wrapper
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────────── */}
        <Route path="/"                   element={<HomePage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/about"              element={<AboutPage />} />
        <Route path="/doctors"            element={<DoctorsPage />} />
        <Route path="/contact"            element={<ContactPage />} />
        <Route path="/emergency"          element={<EmergencyPage />} />
        <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
        <Route path="/reset-password"     element={<ResetPasswordPage />} />
        <Route path="/admin/login"        element={<AdminLoginPage />} />

        {/* ── Patient Routes ────────────────────────────────────────────── */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/book-appointment" element={
          <ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>
        } />
        <Route path="/patient/prescriptions" element={
          <ProtectedRoute role="patient"><PatientPrescriptions /></ProtectedRoute>
        } />
        <Route path="/patient/reports" element={
          <ProtectedRoute role="patient"><PatientReports /></ProtectedRoute>
        } />
        <Route path="/patient/chat" element={
          <ProtectedRoute role="patient"><PatientChat /></ProtectedRoute>
        } />
        <Route path="/patient/chat/:doctorId" element={
          <ProtectedRoute role="patient"><PatientChat /></ProtectedRoute>
        } />
        <Route path="/patient/profile" element={
          <ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>
        } />

        {/* ── Doctor Routes ─────────────────────────────────────────────── */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>
        } />
        <Route path="/doctor/prescribe/:appointmentId/:patientId" element={
          <ProtectedRoute role="doctor"><MakePrescription /></ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute role="doctor"><DoctorPrescriptions /></ProtectedRoute>
        } />
        <Route path="/doctor/chat" element={
          <ProtectedRoute role="doctor"><DoctorChat /></ProtectedRoute>
        } />
        <Route path="/doctor/chat/:patientId" element={
          <ProtectedRoute role="doctor"><DoctorChat /></ProtectedRoute>
        } />
        <Route path="/doctor/profile" element={
          <ProtectedRoute role="doctor"><DoctorProfile /></ProtectedRoute>
        } />

        {/* ── Admin Routes ──────────────────────────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute role="admin"><AdminDoctors /></ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>
        } />

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
