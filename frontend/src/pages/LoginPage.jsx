// ─── Login Page ───────────────────────────────────────────────────────────────
// Features:
//   - Patient / Doctor role tabs
//   - Email + Password login
//   - Google OAuth (sign in with Google)
//   - Signup form with validation
//   - CAPTCHA: 4-digit PIN verification before login
//   - Forgot password link
//   - Disposable email detection
// Styles: auth-page, auth-card, auth-toggle, captcha-box

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { patientLogin, doctorLogin, patientSignup, doctorSignup, googleAuth } from '../services/api'
import Navbar from '../components/Navbar'

// ── Generate random 4-digit CAPTCHA ──────────────────────────────────────────
const generateCaptcha = () => Math.floor(1000 + Math.random() * 9000).toString()

export default function LoginPage() {
  const [tab, setTab]   = useState('patient')    // patient | doctor
  const [mode, setMode] = useState('login')       // login | signup
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [form, setForm] = useState({
    name: '', age: '', sex: '', phone: '', email: '', password: '',
    specialty: '', experience: '', consultationFee: '', bio: '', qualifications: '', hospital: '',
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  // Reset CAPTCHA when tab or mode changes
  useEffect(() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); setCaptchaError(false) }, [tab, mode])

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    // ── CAPTCHA validation (required for login) ──
    if (mode === 'login') {
      if (captchaInput !== captcha) {
        setCaptchaError(true)
        setCaptcha(generateCaptcha())
        setCaptchaInput('')
        toast.error('❌ Wrong CAPTCHA! Please try again.')
        return
      }
    }

    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = tab === 'patient'
          ? await patientLogin({ email: form.email, password: form.password })
          : await doctorLogin({ email: form.email, password: form.password })
      } else {
        res = tab === 'patient'
          ? await patientSignup({ ...form, age: Number(form.age) })
          : await doctorSignup({ ...form, age: Number(form.age), experience: Number(form.experience), consultationFee: Number(form.consultationFee) })

        // Doctor signup is pending approval
        if (res.data.pendingApproval) {
          toast.success(res.data.message, { duration: 6000 })
          setMode('login')
          return
        }
      }

      const { token, user } = res.data
      login(user, token)
      toast.success(mode === 'login' ? '🎉 Welcome back!' : '✅ Account created!')
      navigate(user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
      setCaptcha(generateCaptcha()); setCaptchaInput('')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth success handler ──────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const role = (tab || '').toLowerCase().trim()
      if (!['patient', 'doctor'].includes(role)) {
        toast.error('Google sign-in is only available for Patient or Doctor accounts.')
        return
      }

      const res = await googleAuth(credentialResponse.credential, role)
      if (res.data.pendingApproval) {
        toast.success(res.data.message, { duration: 6000 })
        setMode('login')
        return
      }
      const { token, user } = res.data
      login(user, token)
      toast.success(mode === 'signup' ? '✅ Account created with Google!' : '🎉 Signed in with Google!')
      navigate(user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="auth-header">
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💊</div>
            <h2>SMARTMEDI</h2>
            <p>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
          </div>

          <div className="auth-body">
            {/* ── Role Toggle ──────────────────────────────────────────── */}
            <div className="auth-toggle">
              {['patient', 'doctor'].map(r => (
                <button key={r} className={tab === r ? 'active' : ''} onClick={() => { setTab(r); setMode('login') }}>
                  <i className={`fas fa-${r === 'patient' ? 'user' : 'user-md'}`} />
                  {' '}{r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {/* ── Form ─────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={change} placeholder="Your full name" required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age *</label>
                      <input name="age" type="number" value={form.age} onChange={change} placeholder="Age" required min="1" max="120" />
                    </div>
                    <div className="form-group">
                      <label>Sex *</label>
                      <select name="sex" value={form.sex} onChange={change} required>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={change} placeholder="+8801XXXXXXXXX" required />
                  </div>
                  {/* Doctor-specific fields */}
                  {tab === 'doctor' && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Specialty</label>
                          <input name="specialty" value={form.specialty} onChange={change} placeholder="e.g. Cardiology" />
                        </div>
                        <div className="form-group">
                          <label>Experience (years)</label>
                          <input name="experience" type="number" value={form.experience} onChange={change} placeholder="0" min="0" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Consultation Fee (৳)</label>
                          <input name="consultationFee" type="number" value={form.consultationFee} onChange={change} placeholder="500" />
                        </div>
                        <div className="form-group">
                          <label>Hospital/Clinic</label>
                          <input name="hospital" value={form.hospital} onChange={change} placeholder="Hospital name" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Qualifications</label>
                        <input name="qualifications" value={form.qualifications} onChange={change} placeholder="MBBS, MD, etc." />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={change} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input name="password" type="password" value={form.password} onChange={change} placeholder="Min 6 characters" required minLength="6" />
              </div>

              {/* ── CAPTCHA (login only) ──────────────────────────────── */}
              {mode === 'login' && (
                <div className="captcha-box">
                  <div className="captcha-display">
                    <span className="captcha-code">{captcha}</span>
                    <button type="button" className="captcha-refresh" onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); setCaptchaError(false) }}
                      title="Refresh CAPTCHA">
                      <i className="fas fa-sync-alt" />
                    </button>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text" maxLength="4"
                      value={captchaInput}
                      onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(false) }}
                      placeholder="Enter 4-digit code above"
                      className={captchaError ? 'input-error' : ''}
                      required
                    />
                    {captchaError && <p style={{ color: '#dc3545', fontSize: '0.82rem', marginTop: '4px' }}>❌ Wrong code. Try the new one.</p>}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '16px' }}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> Please wait...</>
                  : mode === 'login' ? '🔐 Sign In' : '✅ Create Account'
                }
              </button>
            </form>

            {/* ── Google Sign-In ────────────────────────────────────────── */}
            <div style={{ marginTop: '20px' }}>
              <div className="auth-divider"><span>or continue with</span></div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed')}
                  theme="outline" shape="rectangular" size="large"
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                />
              </div>
            </div>

            {/* ── Footer links ─────────────────────────────────────────── */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
              {mode === 'login' ? (
                <span>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('signup') }} style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</a></span>
              ) : (
                <span>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('login') }} style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</a></span>
              )}
            </div>
            {mode === 'login' && (
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link to="/forgot-password" style={{ color: '#888', fontSize: '0.88rem' }}>Forgot password?</Link>
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Link to="/" style={{ color: '#aaa', fontSize: '0.85rem' }}>← Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
