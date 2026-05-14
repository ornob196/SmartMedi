// ─── Admin Panel (Dashboard) ──────────────────────────────────────────────────
// Admin dashboard with system statistics and navigation.
// Login: /admin/login → admin@smartmedi.com / admin123

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAdminStats } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const navLinks = [
  { to: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/admin/doctors', icon: 'fa-user-md', label: 'Manage Doctors' },
  { to: '/admin/patients', icon: 'fa-users', label: 'Manage Patients' },
  { to: '/admin/appointments', icon: 'fa-calendar-alt', label: 'Appointments' },
]

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  const statCards = stats ? [
    { icon: 'fa-user-md', label: 'Approved Doctors', value: stats.totalDoctors, color: '#28a745', bg: '#28a74518', to: '/admin/doctors' },
    { icon: 'fa-clock', label: 'Pending Approval', value: stats.pendingDoctors, color: '#ffc107', bg: '#ffc10718', to: '/admin/doctors' },
    { icon: 'fa-users', label: 'Total Patients', value: stats.totalPatients, color: '#0d6efd', bg: '#0d6efd18', to: '/admin/patients' },
    { icon: 'fa-calendar-check', label: 'Appointments', value: stats.totalAppointments, color: '#667eea', bg: '#667eea18', to: '/admin/appointments' },
    { icon: 'fa-file-medical', label: 'Prescriptions', value: stats.totalPrescriptions, color: '#764ba2', bg: '#764ba218' },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: '260px', background: '#1a1a2e', color: '#fff', minHeight: '100vh', padding: '0', flexShrink: 0 }}>
        <div style={{ padding: '30px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            💊 SMARTMEDI
          </div>
          <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', padding: '0 8px' }}>
            Navigation
          </div>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                color: location.pathname === link.to ? '#fff' : 'rgba(255,255,255,0.7)',
                background: location.pathname === link.to ? 'linear-gradient(135deg,#667eea30,#764ba230)' : 'transparent',
                marginBottom: '4px', fontSize: '0.93rem', fontWeight: location.pathname === link.to ? 600 : 400,
                transition: 'all 0.2s', textDecoration: 'none',
              }}>
              <i className={`fas ${link.icon}`} style={{ width: '18px' }} /> {link.label}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />
          <a href="#" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: '#f87171', fontSize: '0.93rem', textDecoration: 'none' }}>
            <i className="fas fa-sign-out-alt" /> Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>Admin Dashboard</h1>
          <p style={{ color: '#666' }}>Welcome back, {user?.name} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="card" style={{ height: '120px', background: '#f5f5f5', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : statCards.map(s => (
            <div key={s.label} className="card" style={{ cursor: s.to ? 'pointer' : 'default' }}
              onClick={() => s.to && navigate(s.to)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', background: s.bg, color: s.color, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                  <i className={`fas ${s.icon}`} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{s.value}</h3>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}><i className="fas fa-bolt" /> Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link to="/admin/doctors" className="btn btn-primary">
              <i className="fas fa-user-check" /> Approve Doctors
            </Link>
            <Link to="/admin/patients" className="btn btn-outline">
              <i className="fas fa-users" /> View Patients
            </Link>
            <Link to="/admin/appointments" className="btn btn-outline">
              <i className="fas fa-calendar-alt" /> View Appointments
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
