// ─── Doctor Profile Page ──────────────────────────────────────────────────────
// Doctor can: view profile, update info, upload profile photo.

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDoctorProfile, updateDoctorProfile, uploadDoctorPhoto } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const navLinks = [
  { to: '/doctor/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/doctor/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: 'fa-file-medical', label: 'Prescriptions' },
  { to: '/doctor/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/doctor/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function DoctorProfile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    getDoctorProfile()
      .then(r => { setProfile(r.data.doctor); setForm(r.data.doctor || {}) })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateDoctorProfile({ specialty: form.specialty, experience: form.experience, consultationFee: form.consultationFee, availability: form.availability, bio: form.bio, qualifications: form.qualifications, hospital: form.hospital, phone: form.phone })
      setProfile(res.data.doctor)
      updateUser(res.data.doctor)
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
      const res = await uploadDoctorPhoto(formData)
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

          <div className="dash-card" style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Profile Photo */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="profile-photo-wrapper">
                <div className="profile-photo-large">
                  {profile?.profilePhoto
                    ? <img src={profile.profilePhoto} alt="profile" />
                    : <i className="fas fa-user-md" />
                  }
                </div>
                <label className="photo-upload-btn" title="Change photo">
                  {uploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-camera" />}
                  <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
              <h2 style={{ marginTop: '12px', fontSize: '1.5rem' }}>Dr. {profile?.name}</h2>
              <p style={{ color: '#666' }}>{profile?.specialty} • {profile?.hospital || 'SMARTMEDI'}</p>
              <p style={{ color: '#667eea', fontSize: '0.88rem', marginTop: '4px' }}>{profile?.qualifications}</p>
            </div>

            {/* Profile Info */}
            {!editing ? (
              <div className="profile-info-grid">
                {[
                  { icon: 'fa-envelope', label: 'Email', value: profile?.email },
                  { icon: 'fa-phone', label: 'Phone', value: profile?.phone },
                  { icon: 'fa-briefcase', label: 'Experience', value: profile?.experience + ' years' },
                  { icon: 'fa-money-bill', label: 'Fee', value: '৳' + profile?.consultationFee },
                  { icon: 'fa-clock', label: 'Availability', value: profile?.availability },
                  { icon: 'fa-hospital', label: 'Hospital', value: profile?.hospital || 'Not set' },
                ].map(f => (
                  <div key={f.label} className="profile-info-item">
                    <i className={`fas ${f.icon}`} style={{ color: 'var(--primary)', marginRight: '8px' }} />
                    <div><span style={{ color: '#aaa', fontSize: '0.8rem' }}>{f.label}</span><strong style={{ display: 'block' }}>{loading ? '...' : f.value}</strong></div>
                  </div>
                ))}
                {profile?.bio && <div className="profile-info-item" style={{ gridColumn: '1/-1' }}><i className="fas fa-info-circle" style={{ color: 'var(--primary)', marginRight: '8px' }} /><div><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Bio</span><p style={{ margin: 0 }}>{profile.bio}</p></div></div>}
                <div style={{ gridColumn: '1/-1', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={() => setEditing(true)}><i className="fas fa-edit" /> Edit Profile</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group"><label>Specialty</label><input value={form.specialty || ''} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
                  <div className="form-group"><label>Experience (years)</label><input type="number" value={form.experience || ''} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Consultation Fee (৳)</label><input type="number" value={form.consultationFee || ''} onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))} /></div>
                  <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Hospital</label><input value={form.hospital || ''} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))} /></div>
                  <div className="form-group"><label>Availability</label><input value={form.availability || ''} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label>Qualifications</label><input value={form.qualifications || ''} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} placeholder="MBBS, MD, etc." /></div>
                <div className="form-group"><label>Bio</label><textarea value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Brief professional bio..." /></div>
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
