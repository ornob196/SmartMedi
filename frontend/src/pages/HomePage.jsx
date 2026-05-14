import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getAllDoctors } from '../services/api'

const testimonials = [
  { initials:'AH', name:'Amina Hassan', loc:'Dhaka, Bangladesh', stars:5, text:'"SMARTMEDI made booking an appointment so easy. The doctor was professional and the video consultation worked seamlessly!"', meta:'Verified Patient • Appointment • 2 weeks ago' },
  { initials:'RK', name:'Ravi Kapoor', loc:'Mumbai, India', stars:5, text:'"Finally, a healthcare platform that feels modern and trustworthy. I love how my records are organized and accessible."', meta:'Verified Patient • Video Consultation • 1 week ago' },
  { initials:'NG', name:'Nisha Gupta', loc:'Delhi, India', stars:5, text:'"Great service! The only wish I have is more doctors available on weekends. Overall, highly recommend."', meta:'Verified Patient • Emergency Care • 3 days ago' },
  { initials:'FA', name:'Fatima Ahmed', loc:'Karachi, Pakistan', stars:5, text:'"Excellent experience from start to finish. The prescription management system is incredibly convenient and secure."', meta:'Verified Patient • Prescription • 5 days ago' },
]

const staticDoctors = [
  { name:'Dr. Touhid Ara Himu', specialty:'Cardiologist', experience:'12', rating:4.8, reviews:234, consultationFee:500, availability:'Available Today' },
  { name:'Dr. Mahmudul Hasan', specialty:'Neurologist', experience:'15', rating:5.0, reviews:189, consultationFee:600, availability:'Next slot: Tomorrow' },
  { name:'Dr. Tasnuva Islam Ayona', specialty:'Orthopedic Surgeon', experience:'18', rating:4.7, reviews:312, consultationFee:500, availability:'Available Today' },
  { name:'Dr. Tousif Rashid', specialty:'Pediatrician', experience:'10', rating:4.9, reviews:267, consultationFee:400, availability:'Available Today' },
]

export default function HomePage() {
  const sliderRef = useRef(null)
  const [doctors, setDoctors] = useState([])
  const scroll = (dir) => sliderRef.current?.scrollBy({ left: dir * 344, behavior: 'smooth' })

  useEffect(() => {
    getAllDoctors().then(r => setDoctors(r.data.doctors?.slice(0, 4) || [])).catch(() => {})
  }, [])

  const displayDoctors = doctors.length > 0 ? doctors : staticDoctors

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="hero" id="home">
          <div className="container" style={{ height: 'auto' }}>
            <div className="hero-grid">
              <div className="hero-content">
                <div className="hero-badge">🏥 Bangladesh's #1 Healthcare Platform</div>
                <h1>Smart Care, <span className="hero-gradient-text">Closer to You</span></h1>
                <p className="hero-subtitle">
                  Book appointments with top doctors, consult online via video, and manage your health records — all from one secure platform.
                </p>
                <div className="hero-actions">
                  <Link to="/login" className="btn btn-primary btn-lg">
                    <i className="fas fa-calendar-check" /> Book Appointment
                  </Link>
                  <Link to="/doctors" className="btn-hero-outline">
                    <i className="fas fa-user-md" /> Find a Doctor
                  </Link>
                </div>
                <div className="hero-trust">
                  <div className="trust-item"><i className="fas fa-check-circle" style={{color:'#28a745'}} /> 125K+ Patients</div>
                  <div className="trust-item"><i className="fas fa-check-circle" style={{color:'#28a745'}} /> 350+ Doctors</div>
                  <div className="trust-item"><i className="fas fa-check-circle" style={{color:'#28a745'}} /> 4.8★ Rating</div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-image-container">
                  <img src="/hero.png" alt="Modern medical team" />
                  {/* Floating cards */}
                  <div className="hero-float-card hero-float-top">
                    <i className="fas fa-user-md" style={{color:'#667eea'}} />
                    <div><strong>350+</strong><span>Specialists</span></div>
                  </div>
                  <div className="hero-float-card hero-float-bottom">
                    <i className="fas fa-calendar-check" style={{color:'#28a745'}} />
                    <div><strong>Instant</strong><span>Booking</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
        <section className="quick-actions">
          <div className="container" style={{ height: 'auto' }}>
            <div className="actions-grid">
              {[
                { to:'/login', icon:'fa-calendar-check', title:'Book Appointment', desc:'Schedule with preferred doctor', color:'#667eea' },
                { to:'/login', icon:'fa-video', title:'Video Consultation', desc:'Consult from home instantly', color:'#764ba2' },
                { to:'/login', icon:'fa-prescription-bottle', title:'My Prescriptions', desc:'Access digital prescriptions', color:'#0d6efd' },
                { to:'/emergency', icon:'fa-phone', title:'Emergency', desc:'Get immediate help', color:'#dc3545', emergency:true },
              ].map(a => (
                <Link key={a.title} to={a.to} className={`action-card ${a.emergency ? 'emergency' : ''}`}>
                  <div className="action-icon" style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}bb)` }}>
                    <i className={`fas ${a.icon}`} />
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="how-it-works" id="howitworks">
          <div className="container" style={{ height: 'auto' }}>
            <div className="section-header">
              <h2>How It Works</h2>
              <p>3 simple steps to better health</p>
            </div>
            <div className="steps-grid">
              {[
                { n:1, icon:'fa-search', t:'Search & Choose', d:'Browse doctors or select a service that matches your health needs.' },
                { n:2, icon:'fa-check-circle', t:'Book or Consult', d:'Schedule an appointment or start an instant video consultation.' },
                { n:3, icon:'fa-file-medical', t:'Get Care & Records', d:'Receive e-prescriptions, lab reports, and digital health records.' },
              ].map(s => (
                <div key={s.n} className="step-card">
                  <div className="step-number">{s.n}</div>
                  <div className="step-icon"><i className={`fas ${s.icon}`} /></div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ──────────────────────────────────────────────────────── */}
        <section className="services" id="services">
          <div className="container" style={{ height: 'auto' }}>
            <div className="section-header">
              <h2>Our Services</h2>
              <p>Comprehensive healthcare solutions for every need</p>
            </div>
            <div className="services-grid">
              {[
                { icon:'fa-heartbeat', t:'General OPD', d:'Consultation for routine health concerns.' },
                { icon:'fa-baby', t:'Pediatrics', d:'Specialized care for children.' },
                { icon:'fa-heart', t:'Cardiology', d:'Heart health assessments and treatment.' },
                { icon:'fa-flask', t:'Lab Tests', d:'Home collection and diagnostic testing.' },
                { icon:'fa-home', t:'Home Care', d:'In-home nursing and medical support.' },
                { icon:'fa-shield-alt', t:'Insurance Support', d:'Cashless treatment assistance.' },
              ].map(s => (
                <article key={s.t} className="service-card">
                  <div className="service-icon"><i className={`fas ${s.icon}`} /></div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <span className="service-link">Learn more <i className="fas fa-arrow-right" /></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED DOCTORS ──────────────────────────────────────────────── */}
        <section className="featured-doctors" id="doctors">
          <div className="container" style={{ height: 'auto' }}>
            <div className="section-header">
              <h2>Meet Our Specialists</h2>
              <p>Experienced doctors ready to care for you</p>
            </div>
            <div className="doctors-grid">
              {displayDoctors.map((d, i) => (
                <article key={i} className="doctor-card">
                  <div className="doctor-image">
                    {d.profilePhoto
                      ? <img src={d.profilePhoto} alt={d.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div className="placeholder-image"><i className="fas fa-user-md" /></div>
                    }
                    <span className={`availability-badge ${(d.availability||'').includes('Tomorrow') ? 'next-slot' : ''}`}>
                      {d.availability || 'Available Today'}
                    </span>
                  </div>
                  <div className="doctor-info">
                    <h3>{d.name}</h3>
                    <p className="specialty">{d.specialty || 'General Physician'}</p>
                    <p className="experience">{d.experience || '5'}+ years experience</p>
                    <div className="rating">
                      {'★'.repeat(Math.floor(d.rating || 4.5))}
                      <span> ({d.rating || 4.5}) {d.reviews || 0} reviews</span>
                    </div>
                    <p className="consultation-fee">৳{d.consultationFee || d.fee || 500} / Consultation</p>
                    <Link to="/login" className="btn btn-primary btn-block">Book Appointment</Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="view-all">
              <Link to="/doctors" className="btn btn-outline">View All Doctors →</Link>
            </div>
          </div>
        </section>

        {/* ── STATS & TESTIMONIALS ──────────────────────────────────────────── */}
        <section className="testimonials-stats">
          <div className="container" style={{ height: 'auto' }}>
            <div className="stats-grid">
              {[{v:'125K+',l:'Patients Served'},{v:'350+',l:'Doctors Onboard'},{v:'12 min',l:'Avg. Wait Time'},{v:'4.8★',l:'Patient Rating'}].map(s => (
                <div key={s.l} className="stat-card"><h3>{s.v}</h3><p>{s.l}</p></div>
              ))}
            </div>
            <div className="testimonials">
              <h2>What Our Patients Say</h2>
              <div className="testimonials-slider-wrapper">
                <div className="testimonials-slider" ref={sliderRef}>
                  {testimonials.map((t, i) => (
                    <div key={i} className="testimonial-card">
                      <div className="review-header">
                        <div className="patient-avatar">{t.initials}</div>
                        <div className="patient-info"><h4>{t.name}</h4><p>{t.loc}</p></div>
                      </div>
                      <div className="stars">{'★'.repeat(t.stars)}</div>
                      <p className="review-text">{t.text}</p>
                      <div className="review-meta">{t.meta}</div>
                    </div>
                  ))}
                </div>
                <div className="slider-controls">
                  <button className="slider-btn" onClick={() => scroll(-1)}><i className="fas fa-chevron-left" /></button>
                  <button className="slider-btn" onClick={() => scroll(1)}><i className="fas fa-chevron-right" /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="cta-section">
          <div className="container" style={{ height: 'auto' }}>
            <div className="cta-content">
              <h2>Ready to Take Control of Your Health?</h2>
              <p>Join thousands of patients who trust SMARTMEDI for their healthcare needs.</p>
              <div className="cta-buttons">
                <Link to="/login" className="btn btn-primary btn-lg">Get Started Free</Link>
                <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
