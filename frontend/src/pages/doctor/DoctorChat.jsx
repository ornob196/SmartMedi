// ─── Doctor Chat Page ─────────────────────────────────────────────────────────
// Real-time chat for doctors - mirrors PatientChat.jsx
// Left: patient list (from appointments), Right: chat area

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getChatHistory, getDoctorAppointments } from '../../services/api'
import Navbar from '../../components/Navbar'
import { io } from 'socket.io-client'

const navLinks = [
  { to: '/doctor/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/doctor/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: 'fa-file-medical', label: 'Prescriptions' },
  { to: '/doctor/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/doctor/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function DoctorChat() {
  const { user, logout } = useAuth()
  const { patientId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [patients, setPatients]     = useState([])
  const [messages, setMessages]     = useState([])
  const [newMsg, setNewMsg]         = useState('')
  const [activePatient, setActivePatient] = useState(null)
  const [roomId, setRoomId]         = useState(null)
  const [typing, setTyping]         = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)


useEffect(() => {
  socketRef.current = io(
    import.meta.env.VITE_API_URL || 'http://localhost:5001',
    {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    }
  );

  return () => {
    if (socketRef.current) socketRef.current.disconnect();
  };
}, []);


  useEffect(() => {
    // Get unique patients from appointments
    getDoctorAppointments().then(r => {
      const appts = r.data.appointments || []
      const uniquePatients = []
      const seen = new Set()
      appts.forEach(a => {
        if (a.patient && !seen.has(a.patient.id)) {
          seen.add(a.patient.id)
          uniquePatients.push(a.patient)
        }
      })
      setPatients(uniquePatients)
      if (patientId) {
        const p = uniquePatients.find(pt => pt.id === patientId)
        if (p) openChat(p)
      }
    }).catch(() => {})
  }, [patientId])

  useEffect(() => {
    if (!socketRef.current) return
    socketRef.current.on('new_message', (msg) => setMessages(prev => [...prev, msg]))
    socketRef.current.on('typing', () => setTyping(true))
    socketRef.current.on('stop_typing', () => setTyping(false))
    return () => { socketRef.current.off('new_message'); socketRef.current.off('typing'); socketRef.current.off('stop_typing') }
  }, [roomId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const openChat = async (patient) => {
    setActivePatient(patient)
    const ids = [user.id, patient.id].sort().join('_')
    setRoomId(ids)
    socketRef.current?.emit('join_room', ids)
    try {
      const res = await getChatHistory(patient.id)
      setMessages(res.data.messages || [])
    } catch { setMessages([]) }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activePatient) return
    socketRef.current?.emit('send_message', {
      roomId, senderId: user.id, senderRole: 'doctor',
      senderName: user.name, receiverId: activePatient.id, content: newMsg.trim(),
    })
    setNewMsg('')
    socketRef.current?.emit('stop_typing', { roomId })
  }

  const handleTyping = (e) => {
    setNewMsg(e.target.value)
    socketRef.current?.emit('typing', { roomId, name: user.name })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socketRef.current?.emit('stop_typing', { roomId }), 1500)
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
              <Link key={link.to} to={link.to} className={`sidebar-link ${location.pathname.startsWith(link.to) && link.to !== '/doctor/dashboard' ? 'active' : location.pathname === link.to ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <i className={`fas ${link.icon}`} /> {link.label}
              </Link>
            ))}
            <a href="#" className="sidebar-link logout" onClick={() => { logout(); navigate('/') }}>
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </nav>
        </aside>

        <main className="dashboard-main" style={{ padding: 0 }}>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)} style={{ position: 'absolute', top: '100px', left: '20px', zIndex: 100 }}><i className="fas fa-bars" /></button>

          <div className="chat-container">
            <div className="chat-sidebar">
              <div className="chat-sidebar-header"><h3><i className="fas fa-comments" /> Patient Messages</h3></div>
              <div className="chat-contacts">
                {patients.length === 0 && (
                  <div style={{ padding: '20px', color: '#aaa', textAlign: 'center' }}>
                    <i className="fas fa-user-friends" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }} />
                    <p>No patients yet. Patients from your appointments will appear here.</p>
                  </div>
                )}
                {patients.map(p => (
                  <div key={p.id} className={`chat-contact ${activePatient?.id === p.id ? 'active' : ''}`} onClick={() => openChat(p)}>
                    <div className="chat-contact-avatar">
                      {p.profilePhoto ? <img src={p.profilePhoto} alt="" /> : <i className="fas fa-user" />}
                    </div>
                    <div className="chat-contact-info">
                      <strong>{p.name}</strong>
                      <span>{p.age} yrs • {p.sex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-main">
              {!activePatient ? (
                <div className="chat-empty">
                  <i className="fas fa-comments" />
                  <p>Select a patient to start messaging</p>
                </div>
              ) : (
                <>
                  <div className="chat-header">
                    <div className="chat-contact-avatar" style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                      {activePatient.profilePhoto ? <img src={activePatient.profilePhoto} alt="" /> : <i className="fas fa-user" />}
                    </div>
                    <div>
                      <strong>{activePatient.name}</strong>
                      <span style={{ display: 'block', color: '#aaa', fontSize: '0.8rem' }}>{activePatient.age} yrs • {activePatient.sex}</span>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {messages.map(msg => (
                      <div key={msg.id} className={`chat-message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                          <p>{msg.content}</p>
                          <span>{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="chat-message received">
                        <div className="chat-bubble typing-indicator"><span /><span /><span /></div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form className="chat-input-bar" onSubmit={sendMessage}>
                    <input type="text" value={newMsg} onChange={handleTyping} placeholder="Type a message..." className="chat-input" />
                    <button type="submit" className="btn btn-primary chat-send-btn" disabled={!newMsg.trim()}>
                      <i className="fas fa-paper-plane" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
