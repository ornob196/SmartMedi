// ─── Admin: Appointments View ─────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAdminAppointments } from '../../services/api'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/admin/doctors', icon: 'fa-user-md', label: 'Manage Doctors' },
  { to: '/admin/patients', icon: 'fa-users', label: 'Manage Patients' },
  { to: '/admin/appointments', icon: 'fa-calendar-alt', label: 'Appointments' },
]

export default function AdminAppointments() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getAdminAppointments()
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <aside style={{ width: '260px', background: '#1a1a2e', color: '#fff', minHeight: '100vh', padding: 0, flexShrink: 0 }}>
        <div style={{ padding: '30px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💊 SMARTMEDI</div>
          <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <div style={{ padding: '20px 16px' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: location.pathname === link.to ? '#fff' : 'rgba(255,255,255,0.7)', background: location.pathname === link.to ? 'linear-gradient(135deg,#667eea30,#764ba230)' : 'transparent', marginBottom: '4px', fontSize: '0.93rem', textDecoration: 'none' }}>
              <i className={`fas ${link.icon}`} style={{ width: '18px' }} /> {link.label}
            </Link>
          ))}
          <a href="#" onClick={() => { logout(); navigate('/') }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: '#f87171', fontSize: '0.93rem', textDecoration: 'none', marginTop: '16px' }}>
            <i className="fas fa-sign-out-alt" /> Logout
          </a>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}><i className="fas fa-calendar-alt" /> All Appointments</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all','pending','confirmed','completed','cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Meet</th></tr></thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.patient?.name}</strong><div style={{ fontSize: '0.8rem', color: '#666' }}>{a.patient?.email}</div></td>
                      <td>Dr. {a.doctor?.name}<div style={{ fontSize: '0.8rem', color: '#666' }}>{a.doctor?.specialty}</div></td>
                      <td style={{ textTransform: 'capitalize' }}>{a.service}</td>
                      <td>{new Date(a.appointmentDate).toLocaleDateString('en-BD')}</td>
                      <td>{a.timeSlot}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td>{a.meetLink ? <a href={a.meetLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#0d6efd', color: '#fff' }}><i className="fas fa-video" /></a> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No appointments found.</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
