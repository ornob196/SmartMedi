// ─── Reset Password Page ──────────────────────────────────────────────────────
// Validates token from URL params and allows user to set a new password.
// URL format: /reset-password?token=xxx&role=patient

import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '../services/api'
import Navbar from '../components/Navbar'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const role  = searchParams.get('role')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6)  { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await resetPassword({ token, role, newPassword: password })
      toast.success('✅ Password reset successful!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !role) {
    return (
      <><Navbar />
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-body" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
              <h3>Invalid Reset Link</h3>
              <p style={{ color: '#666', margin: '12px 0' }}>This link is invalid or has expired.</p>
              <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '12px' }}>Request New Link</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔑</div>
            <h2>Reset Password</h2>
            <p>Enter your new password below</p>
          </div>
          <div className="auth-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required minLength="6" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password" required minLength="6" />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin" /> Resetting...</> : '🔑 Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
