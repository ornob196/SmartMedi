// ─── Patient Profile Page ─────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPatientProfile, updatePatientProfile, uploadPatientPhoto } from '../../services/api'
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

export default function PatientProfile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({ phone: '', bloodGroup: '', address: '' })

  useEffect(() => {
    getPatientProfile()
      .then(r => { setProfile(r.data.patient); setForm({ phone: r.data.patient?.phone || '', bloodGroup: r.data.patient?.bloodGroup || '', address: r.data.patient?.address || '' }) })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updatePatientProfile(form)
      setProfile(p => ({ ...p, ...form }))
      updateUser(form)
      setEditing(false)
      toast.success('✅ Profile updated!')
    } catch { toast.error('Update failed') } finally { setSaving(false) }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('photo', file)
    setUploading(true)
    try {
      const res = await uploadPatientPhoto(formData)
      const photoUrl = res.data.profilePhoto
      setProfile(p => ({ ...p, profilePhoto: photoUrl }))
      updateUser({ profilePhoto: photoUrl })
      toast.success('✅ Profile photo updated!')
    } catch { toast.error('Photo upload failed') } finally { setUploading(false) }
  }

  return (
    <>
      <Navbar />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="dashboard-layout">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <i className="fas fa-user" />}
            </div>
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
          <div className="dash-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="profile-photo-wrapper">
                <div className="profile-photo-large">
                  {profile?.profilePhoto ? <img src={profile.profilePhoto} alt="profile" /> : <i className="fas fa-user" />}
                </div>
                <label className="photo-upload-btn" title="Change photo">
                  {uploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-camera" />}
                  <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
              <h2 style={{ marginTop: '12px', fontSize: '1.5rem' }}>{profile?.name}</h2>
              <p style={{ color: '#666' }}>{profile?.age} years old • {profile?.sex}</p>
            </div>

            {!editing ? (
              <div className="profile-info-grid">
                {[
                  { icon: 'fa-envelope', label: 'Email', value: profile?.email },
                  { icon: 'fa-phone', label: 'Phone', value: profile?.phone },
                  { icon: 'fa-tint', label: 'Blood Group', value: profile?.bloodGroup || 'Not set' },
                  { icon: 'fa-map-marker-alt', label: 'Address', value: profile?.address || 'Not set' },
                ].map(f => (
                  <div key={f.label} className="profile-info-item">
                    <i className={`fas ${f.icon}`} style={{ color: 'var(--primary)', marginRight: '8px' }} />
                    <div><span style={{ color: '#aaa', fontSize: '0.8rem' }}>{f.label}</span><strong style={{ display: 'block' }}>{loading ? '...' : f.value}</strong></div>
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={() => setEditing(true)}><i className="fas fa-edit" /> Edit Profile</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Address</label><textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Your address..." /></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
