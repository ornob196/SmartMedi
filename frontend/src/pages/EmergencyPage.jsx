import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const contacts = [
  { name:'Dhaka Medical College Hospital', phone:'02-55165088', address:'Dhaka-1000', type:'Government' },
  { name:'Square Hospital Ltd.', phone:'02-8159457', address:'Panthapath, Dhaka', type:'Private' },
  { name:'Evercare Hospital', phone:'02-8431661', address:'Bashundhara, Dhaka', type:'Private' },
  { name:'BIRDEM Hospital', phone:'02-8616641', address:'Shahbag, Dhaka', type:'Specialized' },
  { name:'National Heart Foundation', phone:'02-8116953', address:'Mirpur, Dhaka', type:'Specialized' },
  { name:'Chittagong Medical College', phone:'031-619770', address:'Chittagong', type:'Government' },
]

export default function EmergencyPage() {
  return (
    <>
      <Navbar />
      <div className="emergency-hero">
        <h1><i className="fas fa-ambulance"></i> Emergency Services</h1>
        <p style={{fontSize:'1.1rem', opacity:0.9, marginBottom:'24px'}}>Get immediate medical help. Call now or find nearby hospitals.</p>
        <a href="tel:999" className="btn" style={{background:'#fff', color:'#dc3545', fontSize:'1.2rem', padding:'16px 40px', borderRadius:'50px', fontWeight:'700'}}>
          <i className="fas fa-phone"></i> Call 999 – National Emergency
        </a>
      </div>

      <section style={{padding:'60px 20px', maxWidth:'1200px', margin:'0 auto'}}>
        <h2 style={{textAlign:'center', marginBottom:'40px', fontSize:'1.8rem'}}>Emergency Contacts & Hospitals</h2>
        <div className="emergency-grid">
          {contacts.map((c,i) => (
            <div key={i} className="emergency-card">
              <div className="icon"><i className="fas fa-hospital"></i></div>
              <h3 style={{marginBottom:'8px', fontSize:'1rem'}}>{c.name}</h3>
              <p style={{color:'#666', fontSize:'0.85rem', marginBottom:'8px'}}>{c.address}</p>
              <span className="badge badge-confirmed" style={{marginBottom:'12px'}}>{c.type}</span>
              <a href={`tel:${c.phone}`} className="btn btn-danger btn-block"><i className="fas fa-phone"></i> {c.phone}</a>
            </div>
          ))}
        </div>

        <div className="card" style={{marginTop:'40px', background:'linear-gradient(135deg,#dc354510,#c8233310)', borderLeft:'4px solid #dc3545', padding:'24px'}}>
          <h3 style={{color:'#dc3545', marginBottom:'12px'}}><i className="fas fa-exclamation-triangle"></i> Emergency Tips</h3>
          <ul style={{paddingLeft:'20px', color:'#666', lineHeight:'2'}}>
            <li>Stay calm and assess the situation carefully.</li>
            <li>Call emergency services immediately – 999 (Bangladesh).</li>
            <li>Do not move an injured person unless there is immediate danger.</li>
            <li>Provide CPR if the person is unresponsive and not breathing.</li>
            <li>Keep the patient warm and comfortable until help arrives.</li>
          </ul>
        </div>
      </section>
      <Footer />
    </>
  )
}
