// ==================== DOM ELEMENTS ====================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.getElementById('navbar');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const appointmentForm = document.getElementById('appointmentForm');
const loginForm = document.getElementById('loginForm');

// ==================== NAVBAR FUNCTIONALITY ====================

// Toggle mobile menu
navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close menu when link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar')) {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  }
});

// Sticky navbar effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 6px 18px rgba(20, 30, 50, 0.1)';
  } else {
    navbar.style.boxShadow = '0 6px 18px rgba(20, 30, 50, 0.06)';
  }
});

// ==================== MODAL FUNCTIONALITY ====================

loginBtn.addEventListener('click', () => {
  loginModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
  loginModal.classList.remove('active');
});

loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.classList.remove('active');
  }
});

// ==================== FORM VALIDATION ====================

// Phone number validation
function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Appointment form submission
appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = {
    service: document.getElementById('service').value,
    doctor: document.getElementById('doctor').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    fullName: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    age: document.getElementById('age').value,
    notes: document.getElementById('notes').value,
    consultType: document.querySelector('input[name="consultType"]:checked').value
  };

  // Validate phone
  if (!validatePhone(formData.phone)) {
    showNotification('Please enter a valid 10-digit phone number', 'error');
    return;
  }

  // Show confirmation
  console.log('Appointment Data:', formData);
  showNotification(`Appointment confirmed for ${formData.date} at ${formData.time}. A confirmation SMS will be sent to ${formData.phone}`, 'success');

  // Reset form
  appointmentForm.reset();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Basic validation
  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  // Simulate login
  console.log('Login attempt with:', { email, password });
  showNotification('Login successful! Welcome to SMARTMEDI', 'success');

  // Reset form and close modal
  loginForm.reset();
  loginModal.classList.remove('active');
});

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Add notification styles dynamically
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 12px 32px rgba(20, 30, 50, 0.1);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .notification-success {
    border-left: 4px solid #28A745;
  }

  .notification-success i {
    color: #28A745;
  }

  .notification-error {
    border-left: 4px solid #DC3545;
  }

  .notification-error i {
    color: #DC3545;
  }

  .notification-info {
    border-left: 4px solid #0D6EFD;
  }

  .notification-info i {
    color: #0D6EFD;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #6C757D;
    transition: color 0.3s ease;
  }

  .notification-close:hover {
    color: #222;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(20px);
    }
  }

  @media (max-width: 480px) {
    .notification {
      left: 10px;
      right: 10px;
      max-width: none;
    }
  }
`;
document.head.appendChild(style);

// ==================== SMOOTH SCROLL ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ==================== DATE VALIDATION ====================

// Set minimum date to today
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// ==================== DYNAMIC DOCTOR SELECTION ====================

const doctorInput = document.getElementById('doctor');
const doctors = [
  'Dr. Ali Khan - Cardiologist',
  'Dr. Priya Sharma - Neurologist',
  'Dr. Rajesh Patel - Orthopedic',
  'Dr. Meera Gupta - Pediatrician'
];

doctorInput.addEventListener('focus', function() {
  this.placeholder = 'Type to search or select...';
});

doctorInput.addEventListener('input', function(e) {
  const value = e.target.value.toLowerCase();
  // Filter doctors based on input
  const filtered = doctors.filter(d => d.toLowerCase().includes(value));
  console.log('Filtered doctors:', filtered);
});

// ==================== ANIMATION ON SCROLL ====================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add animation styles
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .service-card,
  .doctor-card,
  .testimonial-card,
  .step-card,
  .resource-card {
    opacity: 0;
  }
`;
document.head.appendChild(animStyle);

// Observe cards for animation
document.querySelectorAll('.service-card, .doctor-card, .testimonial-card, .step-card, .resource-card').forEach(el => {
  observer.observe(el);
});

// ==================== LOCAL STORAGE FOR FORM DATA ====================

// Save form data to localStorage
appointmentForm.addEventListener('change', (e) => {
  const formData = new FormData(appointmentForm);
  const data = Object.fromEntries(formData);
  localStorage.setItem('appointmentDraft', JSON.stringify(data));
});

// Load saved form data
window.addEventListener('load', () => {
  const savedData = localStorage.getItem('appointmentDraft');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      Object.keys(data).forEach(key => {
        const input = appointmentForm.elements[key];
        if (input) {
          if (input.type === 'radio') {
            document.querySelector(`input[name="${key}"][value="${data[key]}"]`).checked = true;
          } else {
            input.value = data[key];
          }
        }
      });
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }
});

// ==================== ACCESSIBILITY ====================

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Close modal with Escape
  if (e.key === 'Escape') {
    loginModal.classList.remove('active');
    navMenu.classList.remove('active');
  }

  // Skip to main content
  if (e.key === 's' && e.ctrlKey) {
    e.preventDefault();
    document.querySelector('main').focus();
  }
});

// ==================== PERFORMANCE OPTIMIZATION ====================

// Lazy load images when they come into view
if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

// ==================== ANALYTICS TRACKING ====================

// Track key events
function trackEvent(eventName, eventData) {
  console.log(`Event: ${eventName}`, eventData);
  // You can send this to an analytics service like Google Analytics
}

// Track appointment booking
appointmentForm.addEventListener('submit', () => {
  trackEvent('appointment_book', {
    timestamp: new Date().toISOString(),
    service: document.getElementById('service').value
  });
});

// Track doctor views
document.querySelectorAll('.doctor-card').forEach(card => {
  card.addEventListener('click', () => {
    const doctorName = card.querySelector('h3').textContent;
    trackEvent('doctor_view', { doctor: doctorName });
  });
});

// ==================== TESTIMONIALS SLIDER ====================

function initTestimonialsSlider() {
  const slider = document.getElementById('testimonialSlider');
  const indicatorsContainer = document.getElementById('sliderIndicators');
  const cards = document.querySelectorAll('.slider-card');
  
  if (!slider || cards.length === 0) return;

  // Create indicators
  cards.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'indicator' + (index === 0 ? ' active' : '');
    indicator.onclick = () => {
      slider.children[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    };
    indicatorsContainer.appendChild(indicator);
  });

  // Update indicators on scroll
  slider.addEventListener('scroll', () => {
    const scrollLeft = slider.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 20; // Include gap
    const activeIndex = Math.round(scrollLeft / cardWidth);
    
    document.querySelectorAll('.indicator').forEach((ind, idx) => {
      ind.classList.toggle('active', idx === activeIndex);
    });
  });
}

function scrollTestimonials(direction) {
  const slider = document.getElementById('testimonialSlider');
  const cardWidth = slider.children[0].offsetWidth + 20; // Include gap
  const scrollAmount = cardWidth * direction;
  
  slider.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}

// Initialize slider on page load
document.addEventListener('DOMContentLoaded', () => {
  initTestimonialsSlider();
});

console.log('SMARTMEDI - Smart Health Management System Loaded');
