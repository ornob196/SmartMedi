// ─── Patient Dashboard ────────────────────────────────────────────────────────
// Main dashboard for logged-in patients.
// Shows: stats cards, upcoming appointments, quick actions.
// Sidebar: links to all patient pages (book appointment, prescriptions, reports, chat, profile).
// Fully responsive with mobile sidebar toggle.

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { getMyAppointments, getMyPrescriptions } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([getMyAppointments(), getMyPrescriptions()])
      .then(([a, p]) => {
        setAppointments(a.data.appointments || [])
        setPrescriptions(p.data.prescriptions || [])
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  const upcoming = appointments.filter(a => a.status !== 'cancelled' && new Date(a.appointmentDate) >= new Date())
  const completed = appointments.filter(a => a.status === 'completed')

  // ── Stats cards ──
  const stats = [
    { icon: 'fa-calendar-alt', label: 'Total Appointments', value: appointments.length, color: '#667eea', bg: '#667eea18' },
    { icon: 'fa-calendar-check', label: 'Upcoming', value: upcoming.length, color: '#28a745', bg: '#28a74518' },
    { icon: 'fa-check-circle', label: 'Completed', value: completed.length, color: '#0d6efd', bg: '#0d6efd18' },
    { icon: 'fa-prescription-bottle', label: 'Prescriptions', value: prescriptions.length, color: '#764ba2', bg: '#764ba218' },
  ]

  // ── Sidebar nav links ──
  const navLinks = [
    { to: '/patient/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { to: '/patient/book-appointment', icon: 'fa-calendar-plus', label: 'Book Appointment' },
    { to: '/patient/prescriptions', icon: 'fa-prescription-bottle', label: 'My Prescriptions' },
    { to: '/patient/reports', icon: 'fa-folder-open', label: 'My Reports' },
    { to: '/patient/chat', icon: 'fa-comments', label: 'Messages' },
    { to: '/patient/profile', icon: 'fa-user-circle', label: 'My Profile' },
  ]

  return (
    <>
      <Navbar />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="dashboard-layout">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="profile" />
                : <i className="fas fa-user" />
              }
            </div>
            <div className="sidebar-user-info">
              <strong>{user?.name}</strong>
              <span>Patient</span>
            </div>
          </div>

          <div className="sidebar-title">Patient Panel</div>

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
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars" />
          </button>

          {/* Welcome banner */}
          <div className="welcome-banner patient-banner">
            <div className="welcome-text">
              <h2>Hello, {user?.name} 👋</h2>
              <p>
                Patient ID: {user?.id?.slice(-8).toUpperCase()} &bull; Status: Active &bull;
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="welcome-actions">
              <Link to="/patient/book-appointment" className="btn btn-white">
                <i className="fas fa-calendar-plus" /> Book Appointment
              </Link>
            </div>
          </div>

          {/* Stats */}
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

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            {[
              { to: '/patient/book-appointment', icon: 'fa-calendar-plus', label: 'Book Appointment', color: '#667eea' },
              { to: '/patient/reports', icon: 'fa-upload', label: 'Upload Report', color: '#28a745' },
              { to: '/patient/prescriptions', icon: 'fa-prescription-bottle', label: 'My Prescriptions', color: '#0d6efd' },
              { to: '/patient/chat', icon: 'fa-comments', label: 'Message Doctor', color: '#764ba2' },
            ].map(qa => (
              <Link key={qa.to} to={qa.to} className="quick-action-card">
                <div className="quick-action-icon" style={{ background: qa.color + '18', color: qa.color }}>
                  <i className={`fas ${qa.icon}`} />
                </div>
                <span>{qa.label}</span>
              </Link>
            ))}
          </div>

          {/* Upcoming Appointments */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><i className="fas fa-calendar-alt" /> My Appointments</h3>
              <Link to="/patient/book-appointment" className="btn btn-sm btn-primary">
                <i className="fas fa-plus" /> New
              </Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times" />
                <p>No appointments yet.</p>
                <Link to="/patient/book-appointment" className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className="responsive-table">
                <table>
                  <thead><tr><th>Doctor</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Meet</th></tr></thead>
                  <tbody>
                    {appointments.slice(0, 5).map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">
                              {a.doctor?.profilePhoto ? <img src={a.doctor.profilePhoto} alt="" /> : <i className="fas fa-user-md" />}
                            </div>
                            <div>
                              <strong>Dr. {a.doctor?.name || a.doctorName}</strong>
                              <span>{a.doctor?.specialty}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{a.service}</td>
                        <td>{new Date(a.appointmentDate).toLocaleDateString('en-BD')}</td>
                        <td>{a.timeSlot}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        <td>
                          {a.meetLink ? (
                            <a href={a.meetLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#0d6efd', color: '#fff' }}>
                              <i className="fas fa-video" /> Join
                            </a>
                          ) : <span style={{ color: '#bbb', fontSize: '0.8rem' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          {prescriptions.length > 0 && (
            <div className="dash-card">
              <div className="dash-card-header">
                <h3><i className="fas fa-prescription-bottle" /> Recent Prescriptions</h3>
                <Link to="/patient/prescriptions" className="btn btn-sm btn-outline">View All</Link>
              </div>
              <div className="prescription-list">
                {prescriptions.slice(0, 3).map(p => (
                  <div key={p.id} className="prescription-item">
                    <div className="prescription-item-icon"><i className="fas fa-pills" /></div>
                    <div className="prescription-item-info">
                      <strong>Dr. {p.doctor?.name}</strong>
                      <span>{p.diagnosis || 'General consultation'} • {p.medicines?.length || 0} medicines</span>
                    </div>
                    <div className="prescription-item-date">
                      {new Date(p.createdAt).toLocaleDateString('en-BD')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
