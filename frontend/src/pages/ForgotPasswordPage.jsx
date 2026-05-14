// ─── Forgot Password Page ─────────────────────────────────────────────────────
// Sends password reset email to registered patient/doctor.
// User enters email + selects role → backend sends reset link to email.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPassword } from '../services/api'
import Navbar from '../components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('patient')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword({ email, role })
      setSent(true)
      toast.success('📧 Reset link sent! Check your email.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
            <h2>Forgot Password</h2>
            <p>We'll send a reset link to your email</p>
          </div>
          <div className="auth-body">
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📧</div>
                <h3 style={{ marginBottom: '12px', color: '#198754' }}>Check Your Email!</h3>
                <p style={{ color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
                  If <strong>{email}</strong> is registered, we've sent a password reset link.
                  The link expires in <strong>1 hour</strong>.
                </p>
                <Link to="/login" className="btn btn-primary">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="auth-toggle" style={{ marginBottom: '20px' }}>
                  <button type="button" className={role === 'patient' ? 'active' : ''} onClick={() => setRole('patient')}>
                    <i className="fas fa-user" /> Patient
                  </button>
                  <button type="button" className={role === 'doctor' ? 'active' : ''} onClick={() => setRole('doctor')}>
                    <i className="fas fa-user-md" /> Doctor
                  </button>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required />
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : '📧 Send Reset Link'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link to="/login" style={{ color: '#aaa', fontSize: '0.88rem' }}>← Back to Login</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
