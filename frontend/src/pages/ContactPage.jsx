import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="page-header"><h1>Contact Us</h1><p>We're here to help you 24/7</p></div>
      <section style={{padding:'80px 20px', maxWidth:'1100px', margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px'}}>
          <div>
            <h2 style={{marginBottom:'24px'}}>Get in Touch</h2>
            <form>
              <div className="form-group"><label>Full Name</label><input placeholder="Your name" /></div>
              <div className="form-group"><label>Email</label><input type="email" placeholder="your@email.com" /></div>
              <div className="form-group"><label>Subject</label><input placeholder="How can we help?" /></div>
              <div className="form-group"><label>Message</label><textarea placeholder="Write your message..." rows="5"></textarea></div>
              <button className="btn btn-primary btn-block"><i className="fas fa-paper-plane"></i> Send Message</button>
            </form>
          </div>
          <div>
            <h2 style={{marginBottom:'24px'}}>Contact Information</h2>
            {[{icon:'fa-map-marker-alt',t:'Address',d:'123 Health Street, Basundhara R/A, Dhaka'},{icon:'fa-phone',t:'Phone',d:'+8801780358209'},{icon:'fa-envelope',t:'Email',d:'info@smartmedi.com'},{icon:'fa-clock',t:'Hours',d:'Mon-Fri 9AM-6PM | Sat 10AM-4PM'}].map(c => (
              <div key={c.t} className="card" style={{display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'16px', padding:'20px'}}>
                <div style={{width:'44px', height:'44px', background:'linear-gradient(135deg,#667eea,#764ba2)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'1.1rem', flexShrink:0}}><i className={`fas ${c.icon}`}></i></div>
                <div><h4 style={{marginBottom:'4px'}}>{c.t}</h4><p style={{color:'#666', fontSize:'0.9rem'}}>{c.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
