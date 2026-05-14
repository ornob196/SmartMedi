import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function VideoConsultationPage() {
  return (
    <>
      <Navbar />
      <div className="page-header"><h1>Video Consultation</h1><p>Consult with expert doctors from the comfort of your home</p></div>
      <section style={{padding:'80px 20px', maxWidth:'1100px', margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center', marginBottom:'60px'}}>
          <div>
            <h2 style={{fontSize:'2rem', marginBottom:'20px'}}>How Video Consultation Works</h2>
            {[{n:1,t:'Book a Session',d:'Select your doctor and schedule a convenient time slot.'},{n:2,t:'Get the Link',d:'Receive a secure video call link via email before your appointment.'},{n:3,t:'Join the Call',d:'Connect with your doctor through our encrypted video platform.'},{n:4,t:'Get Prescription',d:'Receive digital prescription and follow-up care instructions.'}].map(s => (
              <div key={s.n} style={{display:'flex', gap:'16px', marginBottom:'20px'}}>
                <div style={{width:'36px', height:'36px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', flexShrink:0}}>{s.n}</div>
                <div><h4 style={{marginBottom:'4px'}}>{s.t}</h4><p style={{color:'#666', fontSize:'0.9rem'}}>{s.d}</p></div>
              </div>
            ))}
            <Link to="/patient/book-appointment" className="btn btn-primary btn-lg" style={{marginTop:'12px'}}>
              <i className="fas fa-video"></i> Book Video Consultation
            </Link>
          </div>
          <div style={{background:'linear-gradient(135deg,#667eea20,#764ba220)', borderRadius:'20px', padding:'60px', textAlign:'center'}}>
            <i className="fas fa-video" style={{fontSize:'6rem', color:'#667eea', opacity:0.7}}></i>
            <p style={{color:'#666', marginTop:'20px', fontSize:'1rem'}}>Secure, HD video calls with your doctor</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px'}}>
          {[{icon:'fa-lock',t:'Secure & Private',d:'End-to-end encrypted consultations'},{icon:'fa-wifi',t:'HD Quality',d:'Crystal clear video and audio'},{icon:'fa-clock',t:'On-Demand',d:'Available 24/7 for urgent care'}].map(f => (
            <div key={f.t} className="card" style={{textAlign:'center', padding:'32px'}}>
              <i className={`fas ${f.icon}`} style={{fontSize:'2rem', color:'#667eea', marginBottom:'12px', display:'block'}}></i>
              <h3 style={{marginBottom:'8px'}}>{f.t}</h3><p style={{color:'#666', fontSize:'0.9rem'}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  )
}
