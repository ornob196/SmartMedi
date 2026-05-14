import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getAllDoctors } from '../services/api'
import { Link } from 'react-router-dom'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllDoctors().then(r => setDoctors(r.data.doctors || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const staticDoctors = [
    { name:'Dr. Touhid Ara Himu', specialty:'Cardiologist', experience:'12 years', rating:4.8, reviews:234, consultationFee:500, availability:'Available Today' },
    { name:'Dr. Mahmudul Hasan', specialty:'Neurologist', experience:'15 years', rating:5.0, reviews:189, consultationFee:600, availability:'Next slot: Tomorrow' },
    { name:'Dr. Tasnuva Islam Ayona', specialty:'Orthopedic Surgeon', experience:'18 years', rating:4.7, reviews:312, consultationFee:500, availability:'Available Today' },
    { name:'Dr. Tousif Rashid', specialty:'Pediatrician', experience:'10 years', rating:4.9, reviews:267, consultationFee:400, availability:'Available Today' },
  ]
  const display = (doctors.length > 0 ? doctors : staticDoctors).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <div className="page-header"><h1>Our Doctors</h1><p>Meet our experienced medical specialists</p></div>
      <section style={{padding:'60px 20px', maxWidth:'1200px', margin:'0 auto'}}>
        <div style={{marginBottom:'32px'}}>
          <input
            type="text" placeholder="🔍 Search by name or specialty..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{width:'100%', maxWidth:'400px', padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #e0e0e0', fontFamily:'Poppins,sans-serif', fontSize:'0.95rem'}}
          />
        </div>
        {loading ? <div className="loading-screen" style={{height:'300px'}}><div className="spinner"></div></div> : (
          <div className="doctors-grid">
            {display.map((d, i) => (
              <article key={i} className="doctor-card">
                <div className="doctor-image">
                  <div className="placeholder-image"><i className="fas fa-user-md"></i></div>
                  <span className={`availability-badge ${(d.availability||'').includes('Tomorrow') ? 'next-slot' : ''}`}>{d.availability || 'Available Today'}</span>
                </div>
                <div className="doctor-info">
                  <h3>{d.name}</h3>
                  <p className="specialty">{d.specialty || 'General Physician'}</p>
                  <p className="experience">{d.experience || '5+'} years • English, Bengali</p>
                  <div className="rating">{'★'.repeat(Math.floor(d.rating||4.5))} <span>({d.rating||4.5}) {d.reviews||0} reviews</span></div>
                  <p className="consultation-fee">৳{d.consultationFee||500} Consultation</p>
                  <Link to="/patient/book-appointment" className="btn btn-primary btn-block">Book Appointment</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
