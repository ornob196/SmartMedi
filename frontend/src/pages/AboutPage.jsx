import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="page-header"><h1>About SMARTMEDI</h1><p>Transforming healthcare through technology</p></div>
      <section style={{padding:'80px 20px', maxWidth:'1000px', margin:'0 auto'}}>
        <div className="card" style={{marginBottom:'32px'}}>
          <h2 style={{fontSize:'1.8rem', marginBottom:'16px', color:'#333'}}>Our Mission</h2>
          <p style={{color:'#666', lineHeight:'1.8', fontSize:'1.05rem'}}>SMARTMEDI is dedicated to making quality healthcare accessible to everyone. We connect patients with experienced doctors through our seamless digital platform, enabling easy appointment booking, video consultations, and secure health record management.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'24px', marginBottom:'40px'}}>
          {[{icon:'fa-shield-alt',t:'Secure & Private',d:'Your health data is encrypted and protected with industry standards.'},{icon:'fa-clock',t:'24/7 Access',d:'Book appointments or access records anytime, day or night.'},{icon:'fa-user-md',t:'Expert Doctors',d:'Board-certified specialists across multiple medical fields.'},{icon:'fa-mobile-alt',t:'Easy to Use',d:'Simple interface designed for all age groups and technical levels.'}].map(f => (
            <div key={f.t} className="card" style={{textAlign:'center'}}>
              <div style={{fontSize:'2.5rem', color:'#667eea', marginBottom:'16px'}}><i className={`fas ${f.icon}`}></i></div>
              <h3 style={{marginBottom:'10px'}}>{f.t}</h3>
              <p style={{color:'#666', fontSize:'0.9rem', lineHeight:'1.6'}}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  )
}
