// ─── Doctor Dashboard ─────────────────────────────────────────────────────────
// Main dashboard for logged-in doctors.
// Shows: stats cards, today's appointments, recent prescriptions.
// Sidebar: links to all doctor pages (appointments, prescriptions, chat, profile).
// Fully responsive with mobile sidebar toggle.

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { getDoctorAppointments, getDoctorPrescriptions } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([getDoctorAppointments(), getDoctorPrescriptions()])
      .then(([a, p]) => {
        setAppointments(a.data.appointments || [])
        setPrescriptions(p.data.prescriptions || [])
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointmentDate === todayStr)
  const pendingAppts = appointments.filter(a => a.status === 'pending')

  // ── Stats cards data ──
  const stats = [
    { icon: 'fa-users', label: 'Total Patients', value: new Set(appointments.map(a => a.patient?.id)).size, color: '#667eea', bg: '#667eea18' },
    { icon: 'fa-calendar-day', label: "Today's Appointments", value: todayAppts.length, color: '#28a745', bg: '#28a74518' },
    { icon: 'fa-clock', label: 'Pending', value: pendingAppts.length, color: '#ffc107', bg: '#ffc10718' },
    { icon: 'fa-file-medical', label: 'Prescriptions', value: prescriptions.length, color: '#764ba2', bg: '#764ba218' },
  ]

  // ── Sidebar nav links ──
  const navLinks = [
    { to: '/doctor/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { to: '/doctor/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
    { to: '/doctor/prescriptions', icon: 'fa-file-medical', label: 'Prescriptions' },
    { to: '/doctor/chat', icon: 'fa-comments', label: 'Messages' },
    { to: '/doctor/profile', icon: 'fa-user-circle', label: 'My Profile' },
  ]

  return (
    <>
      <Navbar />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="dashboard-layout">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {/* Doctor avatar */}
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="profile" />
                : <i className="fas fa-user-md" />
              }
            </div>
            <div className="sidebar-user-info">
              <strong>Dr. {user?.name}</strong>
              <span>{user?.specialty || 'General Physician'}</span>
            </div>
          </div>

          <div className="sidebar-title">Doctor Panel</div>

          <nav className="sidebar-nav">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <i className={`fas ${link.icon}`} />
                {link.label}
              </Link>
            ))}
            <a href="#" className="sidebar-link logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </nav>
        </aside>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <main className="dashboard-main">
          {/* Mobile sidebar toggle */}
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars" />
          </button>

          {/* Welcome banner */}
          <div className="welcome-banner doctor-banner">
            <div className="welcome-text">
              <h2>Welcome, Dr. {user?.name} 👨‍⚕️</h2>
              <p>
                {user?.specialty || 'General Physician'} &bull;
                ID: {user?.id?.slice(-8).toUpperCase()} &bull;
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="welcome-actions">
              <Link to="/doctor/appointments" className="btn btn-white">
                <i className="fas fa-calendar-check" /> View Appointments
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid-dash">
            {stats.map(s => (
              <div key={s.label} className="stat-card-dash">
                <div className="stat-icon-dash" style={{ background: s.bg, color: s.color }}>
                  <i className={`fas ${s.icon}`} />
                </div>
                <div className="stat-info-dash">
                  <h3>{loading ? '...' : s.value}</h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Appointments */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><i className="fas fa-calendar-day" /> Today's Appointments</h3>
              <Link to="/doctor/appointments" className="btn btn-sm btn-outline">View All</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : todayAppts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times" />
                <p>No appointments scheduled for today.</p>
                <span>Enjoy your free time! 🌟</span>
              </div>
            ) : (
              <div className="responsive-table">
                <table>
                  <thead><tr><th>Patient</th><th>Service</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {todayAppts.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">
                              {a.patient?.profilePhoto ? <img src={a.patient.profilePhoto} alt="" /> : <i className="fas fa-user" />}
                            </div>
                            <div>
                              <strong>{a.patient?.name || 'Unknown'}</strong>
                              <span>{a.patient?.age} yrs • {a.patient?.sex}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{a.service}</td>
                        <td>{a.timeSlot}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Link to={`/doctor/prescribe/${a.id}/${a.patient?.id}`} className="btn btn-sm btn-primary">
                              <i className="fas fa-stethoscope" /> Examine
                            </Link>
                            {a.meetLink && (
                              <a href={a.meetLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#0d6efd', color: '#fff' }}>
                                <i className="fas fa-video" /> Meet
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><i className="fas fa-file-medical" /> Recent Prescriptions</h3>
              <Link to="/doctor/prescriptions" className="btn btn-sm btn-outline">View All</Link>
            </div>
            {prescriptions.slice(0, 5).length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-file-medical-alt" />
                <p>No prescriptions written yet.</p>
              </div>
            ) : (
              <div className="prescription-list">
                {prescriptions.slice(0, 5).map(p => (
                  <div key={p.id} className="prescription-item">
                    <div className="prescription-item-icon"><i className="fas fa-pills" /></div>
                    <div className="prescription-item-info">
                      <strong>{p.patient?.name}</strong>
                      <span>{p.diagnosis || 'General'} • {p.medicines?.length || 0} medicines</span>
                    </div>
                    <div className="prescription-item-date">
                      {new Date(p.createdAt).toLocaleDateString('en-BD')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
