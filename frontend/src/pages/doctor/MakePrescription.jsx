// ─── Make Prescription Page (Doctor) ─────────────────────────────────────────
// Doctor examination panel with:
//   - Patient vitals entry (BP, pulse, temp, weight, height, SpO2)
//   - Medicine prescription template (add/remove medicines)
//   - AI disease analysis (analyzes symptoms + reports, suggests diagnoses)
//   - Patient's previous reports viewer
//   - Diagnosis, notes, follow-up date, lab tests
//   - Prescription saved to PostgreSQL when submitted

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPrescription, getPatientReports, analyzeSymptoms } from '../../services/api'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'

// ── Empty medicine template ───────────────────────────────────────────────────
const emptyMedicine = () => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })

export default function MakePrescription() {
  const { appointmentId, patientId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // ── State ──────────────────────────────────────────────────────────────────
  const [medicines, setMedicines] = useState([emptyMedicine()])
  const [vitals, setVitals]       = useState({ bp: '', pulse: '', temperature: '', weight: '', height: '', spo2: '' })
  const [form, setForm]           = useState({ diagnosis: '', symptoms: '', notes: '', followUpDate: '', labTests: '' })
  const [aiResult, setAiResult]   = useState(null)
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('prescription') // prescription | ai | reports

  // ── Load patient's previous reports ──
  useEffect(() => {
    if (patientId) {
      getPatientReports(patientId)
        .then(r => setReports(r.data.reports || []))
        .catch(() => {})
    }
  }, [patientId])

  // ── Medicine handlers ──────────────────────────────────────────────────────
  const addMedicine = () => setMedicines(m => [...m, emptyMedicine()])
  const removeMedicine = (i) => setMedicines(m => m.filter((_, idx) => idx !== i))
  const updateMedicine = (i, field, val) =>
    setMedicines(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med))

  // ── AI Analysis ────────────────────────────────────────────────────────────
  const handleAiAnalysis = async () => {
    if (!form.symptoms && !form.diagnosis) {
      toast.error('Enter symptoms or diagnosis first for AI analysis')
      return
    }
    setAiLoading(true)
    try {
      const res = await analyzeSymptoms({
        symptoms: form.symptoms,
        medicalHistory: '',
        vitals,
        reports,
      })
      setAiResult(res.data.analysis)
      setActiveTab('ai')
      toast.success('🤖 AI analysis complete!')
    } catch {
      toast.error('AI analysis failed')
    } finally {
      setAiLoading(false)
    }
  }

  // ── Submit Prescription ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const validMeds = medicines.filter(m => m.name.trim())
    if (validMeds.length === 0) { toast.error('Add at least one medicine'); return }

    setLoading(true)
    try {
      await createPrescription({
        appointmentId, patientId,
        ...form,
        vitals,
        medicines: validMeds,
        aiSuggestions: aiResult ? JSON.stringify(aiResult.diagnoses) : '',
      })
      toast.success('✅ Prescription saved to database!')
      navigate('/doctor/appointments')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>

          {/* Header */}
          <div className="dash-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg,#198754,#20c997)', color: '#fff' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              <i className="fas fa-stethoscope" /> Patient Examination
            </h2>
            <p style={{ opacity: 0.85 }}>Patient ID: {patientId?.slice(-8).toUpperCase()} • Appointment: {appointmentId?.slice(-8).toUpperCase()}</p>
          </div>

          {/* Tab Navigation */}
          <div className="exam-tabs">
            <button className={activeTab === 'prescription' ? 'active' : ''} onClick={() => setActiveTab('prescription')}>
              <i className="fas fa-file-medical" /> Prescription
            </button>
            <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>
              <i className="fas fa-robot" /> AI Analysis {aiResult && '✓'}
            </button>
            <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
              <i className="fas fa-folder-open" /> Patient Reports ({reports.length})
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── PRESCRIPTION TAB ─────────────────────────────────────── */}
            {activeTab === 'prescription' && (
              <>
                {/* Vitals */}
                <div className="dash-card" style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#6610f2' }}><i className="fas fa-heartbeat" /> Patient Vitals</h3>
                  <div className="vitals-grid">
                    {[
                      { key: 'bp', label: 'Blood Pressure', placeholder: '120/80 mmHg' },
                      { key: 'pulse', label: 'Pulse Rate', placeholder: '72 bpm' },
                      { key: 'temperature', label: 'Temperature', placeholder: '98.6 °F' },
                      { key: 'weight', label: 'Weight', placeholder: '70 kg' },
                      { key: 'height', label: 'Height', placeholder: '170 cm' },
                      { key: 'spo2', label: 'SpO2', placeholder: '98%' },
                    ].map(v => (
                      <div key={v.key} className="form-group">
                        <label>{v.label}</label>
                        <input placeholder={v.placeholder} value={vitals[v.key]}
                          onChange={e => setVitals(vi => ({ ...vi, [v.key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnosis & Symptoms */}
                <div className="dash-card" style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#dc3545' }}><i className="fas fa-diagnoses" /> Clinical Assessment</h3>
                  <div className="form-group">
                    <label>Diagnosis / Chief Complaint</label>
                    <input placeholder="e.g. Acute Upper Respiratory Infection" value={form.diagnosis}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Observed Symptoms</label>
                    <textarea placeholder="Describe symptoms in detail..." value={form.symptoms}
                      onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
                  </div>

                  {/* AI Analysis Button */}
                  <button type="button" className="btn btn-ai" onClick={handleAiAnalysis} disabled={aiLoading}>
                    {aiLoading
                      ? <><i className="fas fa-spinner fa-spin" /> Analyzing...</>
                      : <><i className="fas fa-robot" /> 🤖 AI Disease Analysis</>
                    }
                  </button>
                </div>

                {/* Medicines */}
                <div className="dash-card" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#0d6efd' }}><i className="fas fa-pills" /> Prescribed Medicines</h3>
                    <button type="button" className="btn btn-sm btn-success" onClick={addMedicine}>
                      <i className="fas fa-plus" /> Add Medicine
                    </button>
                  </div>

                  {medicines.map((med, i) => (
                    <div key={i} className="medicine-row">
                      <div className="medicine-number">{i + 1}</div>
                      <div className="medicine-fields">
                        <div className="form-group">
                          <label>Medicine Name *</label>
                          <input placeholder="e.g. Paracetamol" value={med.name}
                            onChange={e => updateMedicine(i, 'name', e.target.value)} />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Dosage</label>
                            <input placeholder="e.g. 500mg" value={med.dosage}
                              onChange={e => updateMedicine(i, 'dosage', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Frequency</label>
                            <select value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)}>
                              <option value="">Select</option>
                              {['Once daily','Twice daily','3x daily','4x daily','Every 4 hours','Every 6 hours','Every 8 hours','As needed','Before meals','After meals','At bedtime'].map(f => <option key={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Duration</label>
                            <input placeholder="e.g. 7 days" value={med.duration}
                              onChange={e => updateMedicine(i, 'duration', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Special Instructions</label>
                            <input placeholder="e.g. After meals, avoid alcohol" value={med.instructions}
                              onChange={e => updateMedicine(i, 'instructions', e.target.value)} />
                          </div>
                        </div>
                      </div>
                      {medicines.length > 1 && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeMedicine(i)}>
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="dash-card" style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '20px' }}><i className="fas fa-notes-medical" /> Additional Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Follow-up Date</label>
                      <input type="date" value={form.followUpDate}
                        onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label>Recommended Lab Tests</label>
                      <input placeholder="e.g. CBC, Blood Sugar, ECG" value={form.labTests}
                        onChange={e => setForm(f => ({ ...f, labTests: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Doctor's Notes / Advice</label>
                    <textarea placeholder="Additional advice, lifestyle recommendations..." value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin" /> Saving...</> : '💾 Save Prescription to Database'}
                </button>
              </>
            )}

            {/* ── AI ANALYSIS TAB ──────────────────────────────────────── */}
            {activeTab === 'ai' && (
              <div className="dash-card">
                <h3 style={{ marginBottom: '20px' }}><i className="fas fa-robot" /> AI Disease Analysis</h3>
                {!aiResult ? (
                  <div className="empty-state">
                    <i className="fas fa-robot" style={{ fontSize: '3rem', color: '#667eea', opacity: 0.5 }} />
                    <p>No analysis yet. Go to Prescription tab and click "AI Disease Analysis"</p>
                  </div>
                ) : (
                  <>
                    {aiResult.diagnoses && (
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ marginBottom: '12px', color: '#dc3545' }}>Probable Diagnoses</h4>
                        {aiResult.diagnoses.map((d, i) => (
                          <div key={i} className="ai-diagnosis-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <strong>{d.condition}</strong>
                              <span style={{ fontWeight: 700, color: d.probability > 50 ? '#dc3545' : d.probability > 25 ? '#ffc107' : '#28a745' }}>
                                {d.probability}%
                              </span>
                            </div>
                            <div className="probability-bar">
                              <div className="probability-fill" style={{ width: `${d.probability}%`, background: d.probability > 50 ? '#dc3545' : d.probability > 25 ? '#ffc107' : '#28a745' }} />
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#666', marginTop: '4px' }}>{d.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {aiResult.observations && (
                      <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                        <strong>Key Observations:</strong>
                        <p style={{ color: '#555', marginTop: '6px', lineHeight: 1.6 }}>{aiResult.observations}</p>
                      </div>
                    )}
                    {aiResult.recommendedTests && aiResult.recommendedTests.length > 0 && (
                      <div>
                        <strong>Recommended Tests:</strong>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {aiResult.recommendedTests.map((t, i) => (
                            <span key={i} className="badge" style={{ background: '#cfe2ff', color: '#084298', padding: '6px 12px' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button type="button" className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => setActiveTab('prescription')}>
                      ← Back to Prescription
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── REPORTS TAB ──────────────────────────────────────────── */}
            {activeTab === 'reports' && (
              <div className="dash-card">
                <h3 style={{ marginBottom: '20px' }}><i className="fas fa-folder-open" /> Patient's Medical Reports</h3>
                {reports.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-folder-open" />
                    <p>No reports uploaded by patient yet.</p>
                  </div>
                ) : (
                  <div className="reports-list">
                    {reports.map(r => (
                      <div key={r.id} className="report-item">
                        <div className="report-icon">
                          <i className={`fas ${r.mimeType?.includes('pdf') ? 'fa-file-pdf' : r.mimeType?.includes('image') ? 'fa-file-image' : 'fa-file-alt'}`} />
                        </div>
                        <div className="report-info">
                          <strong>{r.title}</strong>
                          <span>{r.originalName} • {(r.fileSize / 1024).toFixed(1)} KB • {r.reportType?.replace('_', ' ')}</span>
                          <span>{new Date(r.reportDate).toLocaleDateString('en-BD')}</span>
                        </div>
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                          <i className="fas fa-eye" /> View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
