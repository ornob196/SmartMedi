import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="navbar" id="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <i className="fas fa-heartbeat"></i>
            <span className="brand-name">SMARTMEDI</span>
          </Link>
          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>
          <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/doctors" className="nav-link" onClick={() => setMenuOpen(false)}>Doctors</Link></li>
            <li><Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link></li>
          </ul>
          <div className="navbar-actions">
            <a href="tel:+8801780358209" className="emergency-btn" title="Emergency Hotline">
              <i className="fas fa-phone"></i>
              <span className="hidden-mobile">+8801780358209</span>
            </a>
            {user ? (
              <div className="nav-user-menu">
                <Link
                  to={user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'}
                  className="btn btn-primary"
                >
                  <i className={`fas fa-${user.role === 'patient' ? 'user' : 'user-md'}`}></i>
                  {user.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{marginLeft:'8px'}}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
