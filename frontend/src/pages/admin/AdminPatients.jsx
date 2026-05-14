// ─── Admin: Patient Management ────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAdminPatients, deleteAdminPatient } from '../../services/api'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/admin/doctors', icon: 'fa-user-md', label: 'Manage Doctors' },
  { to: '/admin/patients', icon: 'fa-users', label: 'Manage Patients' },
  { to: '/admin/appointments', icon: 'fa-calendar-alt', label: 'Appointments' },
]

export default function AdminPatients() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    getAdminPatients()
      .then(r => setPatients(r.data.patients || []))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete patient ${name}? This will remove all their data.`)) return
    try {
      await deleteAdminPatient(id)
      setPatients(p => p.filter(pt => pt.id !== id))
      toast.success('Patient deleted')
    } catch { toast.error('Delete failed') }
  }

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()))

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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}><i className="fas fa-users" /> Patient Management</h1>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
              style={{ padding: '10px 16px 10px 36px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', width: '240px' }} />
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Age</th><th>Sex</th><th>Phone</th><th>Blood Group</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea20', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {p.profilePhoto ? <img src={p.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-user" style={{ color: '#667eea' }} />}
                          </div>
                          <div>
                            <strong>{p.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.age}</td>
                      <td>{p.sex}</td>
                      <td>{p.phone}</td>
                      <td>{p.bloodGroup || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(p.createdAt).toLocaleDateString('en-BD')}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>
                          <i className="fas fa-trash" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No patients found.</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
