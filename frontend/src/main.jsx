// ─── main.jsx ─────────────────────────────────────────────────────────────────
// React app entry point.
// Wraps app with: BrowserRouter (routing), GoogleOAuthProvider (Google auth),
//                 Toaster (toast notifications).
// Google Client ID: configured in .env as VITE_GOOGLE_CLIENT_ID

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

// ── Google OAuth Client ID (set in frontend .env as VITE_GOOGLE_CLIENT_ID) ──
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {/* Toast notifications (top-right, 4s duration) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', borderRadius: '10px' },
            success: { style: { background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc' } },
            error: { style: { background: '#f8d7da', color: '#842029', border: '1px solid #f5c2c7' } },
          }}
        />
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
