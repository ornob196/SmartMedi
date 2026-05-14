// ─── Doctor Appointments Page ─────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const navLinks = [
  { to: '/doctor/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/doctor/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: 'fa-file-medical', label: 'Prescriptions' },
  { to: '/doctor/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/doctor/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function DoctorAppointments() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getDoctorAppointments()
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id, status) => {
    try {
      const res = await updateAppointmentStatus(id, status)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...res.data.appointment } : a))
      toast.success(`Appointment ${status}! ${status === 'confirmed' ? '📹 Meet link generated!' : ''}`)
    } catch { toast.error('Update failed') }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <>
      <Navbar />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="dashboard-layout">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <i className="fas fa-user-md" />}
            </div>
            <div className="sidebar-user-info"><strong>Dr. {user?.name}</strong><span>{user?.specialty}</span></div>
          </div>
          <div className="sidebar-title">Doctor Panel</div>
          <nav className="sidebar-nav">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <i className={`fas ${link.icon}`} /> {link.label}
              </Link>
            ))}
            <a href="#" className="sidebar-link logout" onClick={() => { logout(); navigate('/') }}><i className="fas fa-sign-out-alt" /> Logout</a>
          </nav>
        </aside>
        <main className="dashboard-main">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars" /></button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}><i className="fas fa-calendar-check" style={{ color: 'var(--primary)' }} /> My Appointments</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all','pending','confirmed','completed','cancelled'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="dash-card">
            {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            : filtered.length === 0 ? (
              <div className="empty-state"><i className="fas fa-calendar-times" /><p>No appointments found.</p></div>
            ) : (
              <div className="responsive-table">
                <table>
                  <thead><tr><th>Patient</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">{a.patient?.profilePhoto ? <img src={a.patient.profilePhoto} alt="" /> : <i className="fas fa-user" />}</div>
                            <div><strong>{a.patient?.name}</strong><span>{a.patient?.age}yr • {a.patient?.sex}</span></div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{a.service}</td>
                        <td>{new Date(a.appointmentDate).toLocaleDateString('en-BD')}</td>
                        <td>{a.timeSlot}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {a.status === 'pending' && (
                              <>
                                <button className="btn btn-sm btn-success" onClick={() => handleStatus(a.id, 'confirmed')}><i className="fas fa-check" /> Confirm</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleStatus(a.id, 'cancelled')}><i className="fas fa-times" /></button>
                              </>
                            )}
                            {a.status === 'confirmed' && (
                              <>
                                <Link to={`/doctor/prescribe/${a.id}/${a.patient?.id}`} className="btn btn-sm btn-primary"><i className="fas fa-stethoscope" /> Examine</Link>
                                {a.meetLink && <a href={a.meetLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#0d6efd', color: '#fff' }}><i className="fas fa-video" /> Meet</a>}
                                <Link to={`/doctor/chat/${a.patient?.id}`} className="btn btn-sm btn-outline"><i className="fas fa-comment" /></Link>
                              </>
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
        </main>
      </div>
    </>
  )
}
