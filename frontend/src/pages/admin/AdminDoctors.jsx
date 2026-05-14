// ─── Admin: Doctor Management ─────────────────────────────────────────────────
// Shows all doctors (approved + pending).
// Admin can: Approve or Reject pending doctor registrations.
// Pending doctors shown with yellow badge - require approval before they can login.

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAdminDoctors, approveDoctor, rejectDoctor, deleteAdminDoctor } from '../../services/api'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/admin/doctors', icon: 'fa-user-md', label: 'Manage Doctors' },
  { to: '/admin/patients', icon: 'fa-users', label: 'Manage Patients' },
  { to: '/admin/appointments', icon: 'fa-calendar-alt', label: 'Appointments' },
]

export default function AdminDoctors() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all') // all | pending | approved

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = () => {
    setLoading(true)
    getAdminDoctors()
      .then(r => setDoctors(r.data.doctors || []))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false))
  }

  const handleApprove = async (id, name) => {
    try {
      await approveDoctor(id)
      toast.success(`✅ Dr. ${name} approved!`)
      loadDoctors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    }
  }

  const handleReject = async (id, name) => {
    if (!confirm(`Reject Dr. ${name}'s registration? This will delete their account.`)) return
    try {
      await rejectDoctor(id)
      toast.success(`❌ Dr. ${name} rejected and removed.`)
      loadDoctors()
    } catch (err) {
      toast.error('Failed to reject')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete Dr. ${name} from the system?`)) return
    try {
      await deleteAdminDoctor(id)
      toast.success('Doctor deleted')
      loadDoctors()
    } catch {
      toast.error('Delete failed')
    }
  }

  const filtered = filter === 'pending' ? doctors.filter(d => !d.isApproved)
    : filter === 'approved' ? doctors.filter(d => d.isApproved) : doctors

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: '260px', background: '#1a1a2e', color: '#fff', minHeight: '100vh', padding: 0, flexShrink: 0 }}>
        <div style={{ padding: '30px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💊 SMARTMEDI</div>
          <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <div style={{ padding: '20px 16px' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: location.pathname === link.to ? '#fff' : 'rgba(255,255,255,0.7)', background: location.pathname === link.to ? 'linear-gradient(135deg,#667eea30,#764ba230)' : 'transparent', marginBottom: '4px', fontSize: '0.93rem', fontWeight: location.pathname === link.to ? 600 : 400, transition: 'all 0.2s', textDecoration: 'none' }}>
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}><i className="fas fa-user-md" /> Doctor Management</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pending', 'approved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && doctors.filter(d => !d.isApproved).length > 0 && (
                  <span style={{ background: '#dc3545', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', marginLeft: '6px' }}>
                    {doctors.filter(d => !d.isApproved).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pending Alert */}
        {doctors.filter(d => !d.isApproved).length > 0 && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <i className="fas fa-info-circle" />
            <strong>{doctors.filter(d => !d.isApproved).length} doctor(s)</strong> are waiting for approval. Approve them so they can login.
          </div>
        )}

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No doctors found.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th><th>Specialty</th><th>Experience</th><th>Fee</th><th>Status</th><th>Registered</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#667eea20', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {d.profilePhoto ? <img src={d.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-user-md" style={{ color: '#667eea' }} />}
                          </div>
                          <div>
                            <strong>Dr. {d.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{d.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{d.specialty}</td>
                      <td>{d.experience} yrs</td>
                      <td>৳{d.consultationFee}</td>
                      <td>
                        <span className={`badge ${d.isApproved ? 'badge-confirmed' : 'badge-pending'}`}>
                          {d.isApproved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(d.createdAt).toLocaleDateString('en-BD')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {!d.isApproved && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleApprove(d.id, d.name)}>
                                <i className="fas fa-check" /> Approve
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleReject(d.id, d.name)}>
                                <i className="fas fa-times" /> Reject
                              </button>
                            </>
                          )}
                          {d.isApproved && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id, d.name)}>
                              <i className="fas fa-trash" /> Delete
                            </button>
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
  )
}
