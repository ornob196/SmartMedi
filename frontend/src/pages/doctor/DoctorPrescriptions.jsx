// ─── Doctor Prescriptions List Page ──────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDoctorPrescriptions, downloadPrescriptionPDF } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const navLinks = [
  { to: '/doctor/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/doctor/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: 'fa-file-medical', label: 'Prescriptions' },
  { to: '/doctor/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/doctor/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function DoctorPrescriptions() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getDoctorPrescriptions()
      .then(r => setPrescriptions(r.data.prescriptions || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="dashboard-layout">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">{user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <i className="fas fa-user-md" />}</div>
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
          <h2 style={{ marginBottom: '24px' }}><i className="fas fa-file-medical" style={{ color: 'var(--primary)' }} /> Prescriptions Written</h2>
          <div className="dash-card">
            {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            : prescriptions.length === 0 ? <div className="empty-state"><i className="fas fa-file-medical-alt" /><p>No prescriptions written yet.</p></div>
            : (
              <div className="responsive-table">
                <table>
                  <thead><tr><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Follow-up</th><th>Actions</th></tr></thead>
                  <tbody>
                    {prescriptions.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">{p.patient?.profilePhoto ? <img src={p.patient.profilePhoto} alt="" /> : <i className="fas fa-user" />}</div>
                            <div><strong>{p.patient?.name}</strong><span>{p.patient?.age}yr • {p.patient?.sex}</span></div>
                          </div>
                        </td>
                        <td>{p.diagnosis || '—'}</td>
                        <td>{p.medicines?.length || 0} medicines</td>
                        <td>{new Date(p.createdAt).toLocaleDateString('en-BD')}</td>
                        <td>{p.followUpDate ? new Date(p.followUpDate).toLocaleDateString('en-BD') : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-sm btn-outline" onClick={() => downloadPrescriptionPDF(p.id)}><i className="fas fa-download" /> PDF</button>
                            <Link to={`/doctor/chat/${p.patient?.id}`} className="btn btn-sm btn-outline"><i className="fas fa-comment" /></Link>
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
