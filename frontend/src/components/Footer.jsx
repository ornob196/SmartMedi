import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>About SMARTMEDI</h4>
            <p>Leading healthcare management platform providing quality medical services accessible to everyone.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/doctors">Doctors</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/emergency">Emergency</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p><strong>Address:</strong> 123 Health Street, Basundhara R/A</p>
            <p><strong>Phone:</strong> <a href="tel:+8801780358209">+8801780358209</a></p>
            <p><strong>Email:</strong> <a href="mailto:info@smartmedi.com">info@smartmedi.com</a></p>
            <p><strong>Hours:</strong> Mon-Fri 9AM-6PM | Sat 10AM-4PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 SMARTMEDI. All rights reserved. | Built with care for your health.</p>
        </div>
      </div>
    </footer>
  )
}
