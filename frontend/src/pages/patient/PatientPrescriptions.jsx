// ─── Patient Prescriptions Page ───────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyPrescriptions, downloadPrescriptionPDF } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const navLinks = [
  { to: '/patient/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/patient/book-appointment', icon: 'fa-calendar-plus', label: 'Book Appointment' },
  { to: '/patient/prescriptions', icon: 'fa-prescription-bottle', label: 'My Prescriptions' },
  { to: '/patient/reports', icon: 'fa-folder-open', label: 'My Reports' },
  { to: '/patient/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/patient/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function PatientPrescriptions() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getMyPrescriptions()
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
            <div className="sidebar-avatar">{user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <i className="fas fa-user" />}</div>
            <div className="sidebar-user-info"><strong>{user?.name}</strong><span>Patient</span></div>
          </div>
          <div className="sidebar-title">Patient Panel</div>
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
          <h2 style={{ marginBottom: '24px' }}><i className="fas fa-prescription-bottle" style={{ color: 'var(--primary)' }} /> My Prescriptions</h2>
          {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : prescriptions.length === 0 ? <div className="dash-card"><div className="empty-state"><i className="fas fa-prescription-bottle-alt" /><p>No prescriptions yet.</p></div></div>
          : prescriptions.map(p => (
            <div key={p.id} className="prescription-full-card">
              <div className="prescription-full-header" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#667eea18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.doctor?.profilePhoto ? <img src={p.doctor.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <i className="fas fa-user-md" style={{ color: '#667eea' }} />}
                  </div>
                  <div>
                    <strong>Dr. {p.doctor?.name}</strong>
                    <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>{p.doctor?.specialty} • {new Date(p.createdAt).toLocaleDateString('en-BD')}</p>
                    <p style={{ color: '#333', fontSize: '0.85rem', margin: 0 }}>{p.diagnosis || 'General Consultation'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={e => { e.stopPropagation(); downloadPrescriptionPDF(p.id) }} className="btn btn-sm btn-outline"><i className="fas fa-download" /> PDF</button>
                  <i className={`fas fa-chevron-${expanded === p.id ? 'up' : 'down'}`} style={{ color: '#aaa' }} />
                </div>
              </div>
              {expanded === p.id && (
                <div className="prescription-full-body">
                  {p.vitals && Object.keys(p.vitals).some(k => p.vitals[k]) && (
                    <div className="prescription-section">
                      <h4><i className="fas fa-heartbeat" /> Vitals</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {Object.entries(p.vitals).filter(([_, v]) => v).map(([k, v]) => <span key={k} className="vital-badge">{k.toUpperCase()}: {v}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="prescription-section">
                    <h4><i className="fas fa-pills" /> Medicines</h4>
                    {p.medicines?.map((m, i) => (
                      <div key={i} className="medicine-display-item">
                        <span className="medicine-number">{i + 1}</span>
                        <div><strong>{m.name}</strong> — {m.dosage}<span style={{ color: '#666', fontSize: '0.85rem', display: 'block' }}>{m.frequency} • {m.duration} • {m.instructions}</span></div>
                      </div>
                    ))}
                  </div>
                  {p.notes && <div className="prescription-section"><h4><i className="fas fa-notes-medical" /> Notes</h4><p style={{ color: '#555', lineHeight: 1.7 }}>{p.notes}</p></div>}
                  {p.followUpDate && <div className="prescription-section"><h4><i className="fas fa-calendar" /> Follow-up</h4><p>{new Date(p.followUpDate).toLocaleDateString('en-BD')}</p></div>}
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </>
  )
}
