// ─── API Service (Frontend) ───────────────────────────────────────────────────
// All API calls to the SMARTMEDI backend (http://localhost:5001/api).
// Uses Axios with automatic JWT token attachment via interceptor.
// Vite proxy in vite.config.js forwards /api → http://localhost:5001.

import axios from 'axios'

// ── Create Axios instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',                            // Proxied via vite.config.js → localhost:5001
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,                             // 30s timeout
})

// ── Request interceptor: attach JWT token to every request ────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartmedi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const patientSignup = (data) => api.post('/auth/patient/signup', data)
export const patientLogin  = (data) => api.post('/auth/patient/login', data)
export const doctorSignup  = (data) => api.post('/auth/doctor/signup', data)
export const doctorLogin   = (data) => api.post('/auth/doctor/login', data)
export const googleAuth    = (credential, role) => api.post('/auth/google', { credential, role })
export const adminLogin    = (data) => api.post('/auth/admin/login', data)
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const resetPassword  = (data) => api.post('/auth/reset-password', data)

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const getAllDoctors    = () => api.get('/doctors')
export const getDoctorProfile = () => api.get('/doctors/me')
export const updateDoctorProfile = (data) => api.put('/doctors/me', data)
export const uploadDoctorPhoto = (formData) =>
  api.post('/doctors/me/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const getPatientProfile   = () => api.get('/patients/me')
export const updatePatientProfile = (data) => api.put('/patients/me', data)
export const uploadPatientPhoto   = (formData) =>
  api.post('/patients/me/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const bookAppointment        = (data) => api.post('/appointments', data)
export const getMyAppointments      = () => api.get('/appointments/my')
export const getDoctorAppointments  = () => api.get('/appointments/doctor')
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status })
export const cancelAppointment      = (id) => api.delete(`/appointments/${id}`)
export const getBookedSlots         = (doctorId, date) => api.get(`/appointments/slots/${doctorId}?date=${date}`)

// ─────────────────────────────────────────────────────────────────────────────
// PRESCRIPTION ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const createPrescription    = (data) => api.post('/prescriptions', data)
export const getMyPrescriptions    = () => api.get('/prescriptions/my')
export const getDoctorPrescriptions = () => api.get('/prescriptions/doctor')
export const downloadPrescriptionPDF = async (id) => {
  const response = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const blobUrl = window.URL.createObjectURL(blob)
  const openedWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer')

  if (!openedWindow) {
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `prescription-${id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000)
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT ENDPOINTS (Patient medical file uploads)
// ─────────────────────────────────────────────────────────────────────────────
export const uploadReport = (formData) =>
  api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const getMyReports          = () => api.get('/reports/my')
export const getPatientReports     = (patientId) => api.get(`/reports/patient/${patientId}`)
export const deleteReport          = (id) => api.delete(`/reports/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminStats      = () => api.get('/admin/stats')
export const getAdminDoctors    = () => api.get('/admin/doctors')
export const approveDoctor      = (id) => api.post(`/admin/doctors/${id}/approve`)
export const rejectDoctor       = (id) => api.post(`/admin/doctors/${id}/reject`)
export const deleteAdminDoctor  = (id) => api.delete(`/admin/doctors/${id}`)
export const getAdminPatients   = () => api.get('/admin/patients')
export const deleteAdminPatient = (id) => api.delete(`/admin/patients/${id}`)
export const getAdminAppointments = () => api.get('/admin/appointments')

// ─────────────────────────────────────────────────────────────────────────────
// CHAT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const getChatHistory      = (partnerId) => api.get(`/chat/${partnerId}`)
export const getConversations    = () => api.get('/chat')

// ─────────────────────────────────────────────────────────────────────────────
// AI ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const analyzeSymptoms = (data) => api.post('/ai/analyze', data)
export const aiChat          = (data) => api.post('/ai/chat', data)

export default api
