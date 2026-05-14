// ─── Admin Login Page ─────────────────────────────────────────────────────────
// Separate login page for admin.
// Default credentials: admin@smartmedi.com / admin123
// Access via: http://localhost:5173/admin/login

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminLogin } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('admin@smartmedi.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await adminLogin({ email, password })
      login(res.data.user, res.data.token)
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '36px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Admin Login</h2>
          <p style={{ opacity: 0.85 }}>SMARTMEDI Administration Panel</p>
        </div>
        <div style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Admin Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <><i className="fas fa-spinner fa-spin" /> Signing in...</> : '🔐 Sign In as Admin'}
            </button>
          </form>
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.82rem', marginTop: '20px' }}>
            Default: admin@smartmedi.com / admin123<br />
            Run <code>node scripts/seedAdmin.js</code> to create admin.
          </p>
        </div>
      </div>
    </div>
  )
}
