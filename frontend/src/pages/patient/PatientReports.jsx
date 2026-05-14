// ─── Patient Reports Page ─────────────────────────────────────────────────────
// Patients can upload medical reports (PDF, JPG, PNG, TXT, DOCX).
// Reports are stored on the server and listed here.
// Features: drag-and-drop upload, report type categorization, file preview.

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { uploadReport, getMyReports, deleteReport } from '../../services/api'
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

const REPORT_TYPES = [
  { value: 'blood_test', label: '🩸 Blood Test' },
  { value: 'xray', label: '🦴 X-Ray' },
  { value: 'mri', label: '🧠 MRI Scan' },
  { value: 'ct_scan', label: '🫁 CT Scan' },
  { value: 'ecg', label: '❤️ ECG' },
  { value: 'prescription', label: '💊 Prescription' },
  { value: 'other', label: '📄 Other' },
]

const getFileIcon = (mimeType) => {
  if (!mimeType) return 'fa-file-alt'
  if (mimeType.includes('pdf')) return 'fa-file-pdf'
  if (mimeType.includes('image')) return 'fa-file-image'
  if (mimeType.includes('text')) return 'fa-file-alt'
  return 'fa-file'
}

export default function PatientReports() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', reportType: 'other', reportDate: '' })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    getMyReports()
      .then(r => setReports(r.data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) { toast.error('Please select a file'); return }
    if (!form.title) { toast.error('Please enter a report title'); return }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('reportType', form.reportType)
    formData.append('reportDate', form.reportDate || new Date().toISOString().split('T')[0])

    setUploading(true)
    try {
      const res = await uploadReport(formData)
      setReports(r => [res.data.report, ...r])
      setShowForm(false)
      setSelectedFile(null)
      setForm({ title: '', description: '', reportType: 'other', reportDate: '' })
      toast.success('✅ Report uploaded successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return
    try {
      await deleteReport(id)
      setReports(r => r.filter(rep => rep.id !== id))
      toast.success('Report deleted')
    } catch {
      toast.error('Delete failed')
    }
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
            <a href="#" className="sidebar-link logout" onClick={() => { logout(); navigate('/') }}>
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </nav>
        </aside>

        <main className="dashboard-main">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars" /></button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2><i className="fas fa-folder-open" style={{ color: 'var(--primary)' }} /> My Medical Reports</h2>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <i className="fas fa-upload" /> Upload Report
            </button>
          </div>

          {/* Upload Form */}
          {showForm && (
            <div className="dash-card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>📤 Upload New Report</h3>
              <form onSubmit={handleUpload}>
                {/* Drop Zone */}
                <div
                  className={`drop-zone ${dragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}>
                  <input id="file-input" type="file" hidden
                    accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                    onChange={handleFileChange} />
                  {selectedFile ? (
                    <div>
                      <i className={`fas ${getFileIcon(selectedFile.type)}`} style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }} />
                      <p><strong>{selectedFile.name}</strong></p>
                      <p style={{ color: '#666', fontSize: '0.85rem' }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: '#ccc', marginBottom: '12px' }} />
                      <p><strong>Click or drag & drop your file here</strong></p>
                      <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Supports: PDF, JPG, PNG, TXT, DOCX (max 20MB)</p>
                    </div>
                  )}
                </div>

                <div className="form-row" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label>Report Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Blood Test Results - May 2025" required />
                  </div>
                  <div className="form-group">
                    <label>Report Type</label>
                    <select value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))}>
                      {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Report Date</label>
                    <input type="date" value={form.reportDate} onChange={e => setForm(f => ({ ...f, reportDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of this report" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? <><i className="fas fa-spinner fa-spin" /> Uploading...</> : '📤 Upload Report'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setSelectedFile(null) }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reports List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : reports.length === 0 ? (
            <div className="dash-card">
              <div className="empty-state">
                <i className="fas fa-folder-open" />
                <p>No reports uploaded yet.</p>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '12px' }}>
                  Upload Your First Report
                </button>
              </div>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map(r => (
                <div key={r.id} className="report-card">
                  <div className="report-card-icon">
                    <i className={`fas ${getFileIcon(r.mimeType)}`} />
                  </div>
                  <div className="report-card-info">
                    <h4>{r.title}</h4>
                    <p>{REPORT_TYPES.find(t => t.value === r.reportType)?.label || r.reportType}</p>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>
                      {r.originalName} • {(r.fileSize / 1024).toFixed(1)} KB
                    </p>
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>
                      {new Date(r.reportDate).toLocaleDateString('en-BD')}
                    </p>
                    {r.description && <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>{r.description}</p>}
                  </div>
                  <div className="report-card-actions">
                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                      <i className="fas fa-eye" /> View
                    </a>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
