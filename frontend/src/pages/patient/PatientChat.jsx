// ─── Chat Page (Patient) ──────────────────────────────────────────────────────
// Real-time chat between patient and doctor using Socket.IO.
// Left panel: conversation list (doctors chatted with)
// Right panel: chat messages with real-time updates
// Messages saved to PostgreSQL via Socket.IO → server

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getChatHistory, getAllDoctors } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import { io } from 'socket.io-client'

const navLinks = [
  { to: '/patient/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/patient/book-appointment', icon: 'fa-calendar-plus', label: 'Book Appointment' },
  { to: '/patient/prescriptions', icon: 'fa-prescription-bottle', label: 'My Prescriptions' },
  { to: '/patient/reports', icon: 'fa-folder-open', label: 'My Reports' },
  { to: '/patient/chat', icon: 'fa-comments', label: 'Messages' },
  { to: '/patient/profile', icon: 'fa-user-circle', label: 'My Profile' },
]

export default function PatientChat() {
  const { user, logout } = useAuth()
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [doctors, setDoctors]     = useState([])
  const [messages, setMessages]   = useState([])
  const [newMsg, setNewMsg]       = useState('')
  const [activeDoctor, setActiveDoctor] = useState(null)
  const [roomId, setRoomId]       = useState(null)
  const [typing, setTyping]       = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // ── Connect Socket.IO ──
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

  // ── Load doctors list ──
  useEffect(() => {
    getAllDoctors().then(r => {
      setDoctors(r.data.doctors || [])
      if (doctorId) {
        const doc = r.data.doctors?.find(d => d.id === doctorId)
        if (doc) openChat(doc)
      }
    }).catch(() => {})
  }, [doctorId])

  // ── Listen for new messages in current room ──
  useEffect(() => {
    if (!socketRef.current) return
    socketRef.current.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    socketRef.current.on('typing', () => setTyping(true))
    socketRef.current.on('stop_typing', () => setTyping(false))
    return () => {
      socketRef.current.off('new_message')
      socketRef.current.off('typing')
      socketRef.current.off('stop_typing')
    }
  }, [roomId])

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async (doc) => {
    setActiveDoctor(doc)
    const ids = [user.id, doc.id].sort().join('_')
    setRoomId(ids)
    socketRef.current?.emit('join_room', ids)
    try {
      const res = await getChatHistory(doc.id)
      setMessages(res.data.messages || [])
    } catch { setMessages([]) }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activeDoctor) return
    socketRef.current?.emit('send_message', {
      roomId, senderId: user.id, senderRole: 'patient',
      senderName: user.name, receiverId: activeDoctor.id, content: newMsg.trim(),
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
              {user?.profilePhoto ? <img src={user.profilePhoto} alt="" /> : <i className="fas fa-user" />}
            </div>
            <div className="sidebar-user-info"><strong>{user?.name}</strong><span>Patient</span></div>
          </div>
          <div className="sidebar-title">Patient Panel</div>
          <nav className="sidebar-nav">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`sidebar-link ${location.pathname.startsWith(link.to) && link.to !== '/patient/dashboard' ? 'active' : location.pathname === link.to ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
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
            {/* ── Doctor List ─────────────────────────────────────────── */}
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <h3><i className="fas fa-comments" /> Messages</h3>
              </div>
              <div className="chat-contacts">
                {doctors.map(doc => (
                  <div key={doc.id}
                    className={`chat-contact ${activeDoctor?.id === doc.id ? 'active' : ''}`}
                    onClick={() => openChat(doc)}>
                    <div className="chat-contact-avatar">
                      {doc.profilePhoto ? <img src={doc.profilePhoto} alt="" /> : <i className="fas fa-user-md" />}
                    </div>
                    <div className="chat-contact-info">
                      <strong>Dr. {doc.name}</strong>
                      <span>{doc.specialty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Chat Area ────────────────────────────────────────────── */}
            <div className="chat-main">
              {!activeDoctor ? (
                <div className="chat-empty">
                  <i className="fas fa-comments" />
                  <p>Select a doctor to start messaging</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <div className="chat-contact-avatar" style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                      {activeDoctor.profilePhoto ? <img src={activeDoctor.profilePhoto} alt="" /> : <i className="fas fa-user-md" />}
                    </div>
                    <div>
                      <strong>Dr. {activeDoctor.name}</strong>
                      <span style={{ display: 'block', color: '#aaa', fontSize: '0.8rem' }}>{activeDoctor.specialty}</span>
                    </div>
                  </div>

                  {/* Messages */}
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
                        <div className="chat-bubble typing-indicator">
                          <span /><span /><span />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form className="chat-input-bar" onSubmit={sendMessage}>
                    <input
                      type="text" value={newMsg} onChange={handleTyping}
                      placeholder="Type a message..."
                      className="chat-input" />
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
