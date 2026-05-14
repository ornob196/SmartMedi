// ─── Book Appointment Page ────────────────────────────────────────────────────
// Patient books an appointment with a doctor from the database.
// Features:
//   - Doctors loaded in real-time from PostgreSQL
//   - Booked time slots are disabled (can't double-book)
//   - Doctor info shows specialty, fee, availability
//   - Form: service, doctor (from DB), date, time slot, symptoms

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookAppointment, getAllDoctors, getBookedSlots } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const ALL_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM']

// ── Patient sidebar nav links ──────────────────────────────────────────────────
const navLinks = [
  { to: '/patient/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/patient/book-appointment', icon: 'fa-calendar-plus', label: 'Book Appointment' },
  { to: '/patient/prescriptions', icon: 'fa-prescription-bottle', label: 'My Prescriptions' },
  { to: '/patient/reports', icon: 'fa-folder-open', label: 'My Reports' },
  { to: '/patient/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/patient/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function BookAppointment() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [doctors, setDoctors]         = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading]         = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [form, setForm] = useState({
    service: '', doctorId: '', appointmentDate: '', timeSlot: '',
    age: user?.age || '', bloodType: '', symptoms: '', medicalHistory: '',
  })

  // ── Load all approved doctors from DB ──
  useEffect(() => {
    getAllDoctors()
      .then(r => setDoctors(r.data.doctors || []))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoadingDoctors(false))
  }, [])

  // ── Load booked slots when doctor + date selected ──
  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      getBookedSlots(form.doctorId, form.appointmentDate)
        .then(r => setBookedSlots(r.data.bookedSlots || []))
        .catch(() => {})
    }
  }, [form.doctorId, form.appointmentDate])

  const change = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (e.target.name === 'doctorId') {
      const doc = doctors.find(d => d.id === e.target.value)
      setSelectedDoctor(doc || null)
      setForm(f => ({ ...f, doctorId: e.target.value, timeSlot: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookAppointment({ ...form, age: Number(form.age) })
      toast.success('✅ Appointment booked successfully!')
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="dashboard-layout">
        {/* Sidebar */}
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
            <a href="#" className="sidebar-link logout" onClick={() => { logout(); navigate('/') }}>
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </nav>
        </aside>

        <main className="dashboard-main">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars" /></button>

          <div className="dash-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-calendar-plus" style={{ color: 'var(--primary)' }} />
              Book an Appointment
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Service */}
              <div className="form-group">
                <label>Medical Service *</label>
                <select name="service" value={form.service} onChange={change} required>
                  <option value="">-- Choose a service --</option>
                  {['general','cardiology','neurology','orthopedic','pediatrics','dermatology'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection (from PostgreSQL) */}
              <div className="form-group">
                <label>Select Doctor * <span style={{ color: '#28a745', fontSize: '0.8rem' }}>({doctors.length} doctors available)</span></label>
                {loadingDoctors ? (
                  <div className="input-loading"><i className="fas fa-spinner fa-spin" /> Loading doctors from database...</div>
                ) : (
                  <select name="doctorId" value={form.doctorId} onChange={change} required>
                    <option value="">-- Select a Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.name} — {d.specialty} — ৳{d.consultationFee} — {d.availability}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Doctor Info Card */}
              {selectedDoctor && (
                <div className="doctor-info-card">
                  {selectedDoctor.profilePhoto && <img src={selectedDoctor.profilePhoto} alt="" className="doctor-info-photo" />}
                  <div>
                    <strong>Dr. {selectedDoctor.name}</strong>
                    <p>{selectedDoctor.specialty} • {selectedDoctor.experience} yrs exp • ⭐ {selectedDoctor.rating}</p>
                    <p style={{ color: '#667eea', fontWeight: 600 }}>৳{selectedDoctor.consultationFee} per consultation</p>
                    {selectedDoctor.hospital && <p style={{ color: '#666' }}><i className="fas fa-hospital" /> {selectedDoctor.hospital}</p>}
                  </div>
                </div>
              )}

              {/* Date + Time */}
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={change} required
                    min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  {form.doctorId && form.appointmentDate ? (
                    <div className="time-slots-grid">
                      {ALL_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot)
                        return (
                          <button key={slot} type="button"
                            className={`time-slot-btn ${form.timeSlot === slot ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                            onClick={() => !isBooked && setForm(f => ({ ...f, timeSlot: slot }))}
                            disabled={isBooked}>
                            {slot} {isBooked && '✗'}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="input-loading" style={{ color: '#aaa', padding: '12px' }}>
                      Select doctor and date first
                    </div>
                  )}
                </div>
              </div>

              {/* Age + Blood Type */}
              <div className="form-row">
                <div className="form-group">
                  <label>Your Age *</label>
                  <input type="number" name="age" value={form.age} onChange={change} required min="1" max="120" />
                </div>
                <div className="form-group">
                  <label>Blood Type</label>
                  <select name="bloodType" value={form.bloodType} onChange={change}>
                    <option value="">-- Select --</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div className="form-group">
                <label>Symptoms *</label>
                <textarea name="symptoms" value={form.symptoms} onChange={change} required
                  placeholder="Describe your current symptoms in detail..." />
              </div>

              {/* Medical History */}
              <div className="form-group">
                <label>Medical History (Optional)</label>
                <textarea name="medicalHistory" value={form.medicalHistory} onChange={change}
                  placeholder="Any previous medical conditions, surgeries, allergies..." />
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || !form.timeSlot}>
                {loading ? <><i className="fas fa-spinner fa-spin" /> Booking...</> : '📅 Confirm Appointment'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
