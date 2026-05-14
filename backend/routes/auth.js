// ─── Auth Routes (PostgreSQL / Sequelize) ─────────────────────────────────────
// Handles: Patient signup/login, Doctor signup/login, Google OAuth,
//          Forgot Password (email), Reset Password, Admin login.
// Security: Disposable email blocking, bcrypt hashing, JWT tokens.
// Doctor accounts require Admin approval before login is allowed.

require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { Patient, Doctor, Admin } = require('../models');

const router = express.Router();

// ── JWT Token Generator ────────────────────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── Blocked disposable email domains ──────────────────────────────────────────
const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'fakeinbox.com', 'yopmail.com', '10minutemail.com', 'trashmail.com',
  'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com',
];

const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
};

// ── Email Transporter (Gmail SMTP) ────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

// ── Google OAuth Client ────────────────────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT SIGNUP
// POST /api/auth/patient/signup
// ─────────────────────────────────────────────────────────────────────────────
router.post('/patient/signup', async (req, res) => {
  try {
    const { name, age, sex, phone, email, password } = req.body;
    if (!name || !age || !sex || !phone || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (age < 1 || age > 120)
      return res.status(400).json({ success: false, message: 'Valid age required (1-120)' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    if (isDisposableEmail(email))
      return res.status(400).json({ success: false, message: 'Disposable/fake email addresses are not allowed. Please use a real email.' });

    const exists = await Patient.findOne({ where: { email: email.toLowerCase() } });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const patient = await Patient.create({ name, age, sex, phone, email: email.toLowerCase(), password });
    const token = generateToken(patient.id, 'patient');

    res.status(201).json({
      success: true, message: 'Registration successful', token,
      user: { id: patient.id, name: patient.name, email: patient.email, role: 'patient', profilePhoto: patient.profilePhoto },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT LOGIN
// POST /api/auth/patient/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/patient/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const patient = await Patient.findOne({ where: { email: email.toLowerCase() } });
    if (!patient)
      return res.status(401).json({ success: false, message: 'Email not found' });
    if (!patient.password)
      return res.status(401).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' });

    const isMatch = await patient.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Wrong password' });

    const token = generateToken(patient.id, 'patient');
    res.json({
      success: true, message: 'Login successful', token,
      user: { id: patient.id, name: patient.name, email: patient.email, phone: patient.phone, sex: patient.sex, role: 'patient', profilePhoto: patient.profilePhoto },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR SIGNUP
// POST /api/auth/doctor/signup
// Doctor accounts start as pending (isApproved: false) - Admin must approve.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/doctor/signup', async (req, res) => {
  try {
    const { name, age, sex, phone, email, password, specialty, experience, consultationFee, bio, qualifications, hospital } = req.body;
    if (!name || !age || !sex || !phone || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    if (isDisposableEmail(email))
      return res.status(400).json({ success: false, message: 'Disposable/fake email addresses are not allowed. Please use a real email.' });

    const exists = await Doctor.findOne({ where: { email: email.toLowerCase() } });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    await Doctor.create({
      name, age, sex, phone, email: email.toLowerCase(), password,
      specialty: specialty || 'General Physician',
      experience: experience || 0,
      consultationFee: consultationFee || 500,
      bio: bio || '', qualifications: qualifications || '', hospital: hospital || '',
      isApproved: false, // Admin must approve before doctor can login
    });

    res.status(201).json({
      success: true,
      message: '✅ Registration submitted! Your account is pending admin approval. You will be notified once approved.',
      pendingApproval: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR LOGIN
// POST /api/auth/doctor/login
// Blocked if isApproved = false (pending admin approval)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/doctor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const doctor = await Doctor.findOne({ where: { email: email.toLowerCase() } });
    if (!doctor)
      return res.status(401).json({ success: false, message: 'Email not found' });

    // ── Admin approval check ──
    if (!doctor.isApproved)
      return res.status(403).json({ success: false, message: '⏳ Your account is pending admin approval. Please wait for confirmation.' });

    if (!doctor.password)
      return res.status(401).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' });

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Wrong password' });

    const token = generateToken(doctor.id, 'doctor');
    res.json({
      success: true, message: 'Login successful', token,
      user: { id: doctor.id, name: doctor.name, email: doctor.email, specialty: doctor.specialty, role: 'doctor', profilePhoto: doctor.profilePhoto },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH
// POST /api/auth/google
// Verifies Google ID token, finds or creates user in DB.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    const normalizedRole = (role || '').toLowerCase().trim();

    if (!credential || !normalizedRole)
      return res.status(400).json({ success: false, message: 'Google credential and role required' });
    if (!['patient', 'doctor'].includes(normalizedRole))
      return res.status(400).json({ success: false, message: 'Invalid role. Allowed: patient, doctor' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, email_verified: emailVerified, name, picture } = ticket.getPayload();
    const normalizedEmail = (email || '').toLowerCase();

    if (!emailVerified)
      return res.status(401).json({ success: false, message: 'Google account email is not verified' });
    if (!normalizedEmail)
      return res.status(400).json({ success: false, message: 'Google account email is required' });

    if (normalizedRole === 'patient') {
      const [patient] = await Patient.findOrCreate({
        where: { email: normalizedEmail },
        defaults: {
          name, email: normalizedEmail, googleId, age: 18, sex: 'Other', phone: 'Not provided',
          profilePhoto: picture || null,
        },
      });
      if (patient.googleId && patient.googleId !== googleId) {
        return res.status(401).json({ success: false, message: 'Google account does not match linked account' });
      }
      if (!patient.googleId) {
        await patient.update({ googleId, profilePhoto: patient.profilePhoto || picture });
      }
      const token = generateToken(patient.id, 'patient');
      return res.json({
        success: true, message: 'Google login successful', token,
        user: { id: patient.id, name: patient.name, email: patient.email, role: 'patient', profilePhoto: patient.profilePhoto },
      });
    }

    if (normalizedRole === 'doctor') {
      const [doctor, created] = await Doctor.findOrCreate({
        where: { email: normalizedEmail },
        defaults: {
          name, email: normalizedEmail, googleId, age: 30, sex: 'Other', phone: 'Not provided',
          specialty: 'General Physician', profilePhoto: picture || null, isApproved: false,
        },
      });
      if (created) {
        return res.status(200).json({
          success: true,
          message: '✅ Doctor account created via Google! Pending admin approval.',
          pendingApproval: true,
        });
      }
      if (doctor.googleId && doctor.googleId !== googleId) {
        return res.status(401).json({ success: false, message: 'Google account does not match linked account' });
      }
      if (!doctor.googleId) await doctor.update({ googleId, profilePhoto: doctor.profilePhoto || picture });
      if (!doctor.isApproved) {
        return res.status(200).json({
          success: true,
          message: '⏳ Your account is pending admin approval.',
          pendingApproval: true,
        });
      }

      const token = generateToken(doctor.id, 'doctor');
      return res.json({
        success: true, message: 'Google login successful', token,
        user: { id: doctor.id, name: doctor.name, email: doctor.email, specialty: doctor.specialty, role: 'doctor', profilePhoto: doctor.profilePhoto },
      });
    }
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// Sends password reset email to registered patient/doctor.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role)
      return res.status(400).json({ success: false, message: 'Email and role are required' });

    let user;
    if (role === 'patient') user = await Patient.findOne({ where: { email: email.toLowerCase() } });
    else if (role === 'doctor') user = await Doctor.findOne({ where: { email: email.toLowerCase() } });

    // Always respond same way for security (don't reveal if user exists)
    if (!user)
      return res.json({ success: true, message: '📧 If this email is registered, a reset link has been sent.' });

    // Generate and hash reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save hashed token to DB
    await user.update({ resetPasswordToken: hashedToken, resetPasswordExpires: expires });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&role=${role}`;

    // Send reset email
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"SMARTMEDI 💊" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'SMARTMEDI - Password Reset Request',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:40px;border-radius:16px;">
            <div style="text-align:center;margin-bottom:30px;">
              <h1 style="color:#667eea;font-size:2rem;margin:0;">💊 SMARTMEDI</h1>
              <p style="color:#666;margin-top:8px;">Smart Health Management System</p>
            </div>
            <div style="background:white;padding:30px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <h2 style="color:#333;margin-bottom:16px;">🔐 Password Reset Request</h2>
              <p style="color:#555;line-height:1.7;">Hello <strong>${user.name}</strong>,</p>
              <p style="color:#555;line-height:1.7;">We received a request to reset your password. Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
              <div style="text-align:center;margin:30px 0;">
                <a href="${resetUrl}" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:1rem;font-weight:600;display:inline-block;">Reset My Password</a>
              </div>
              <p style="color:#888;font-size:0.85rem;">If you didn't request this, you can safely ignore this email.</p>
              <p style="color:#888;font-size:0.82rem;word-break:break-all;margin-top:12px;">Direct link: <a href="${resetUrl}" style="color:#667eea;">${resetUrl}</a></p>
            </div>
            <p style="text-align:center;color:#bbb;font-size:0.8rem;margin-top:20px;">© 2025 SMARTMEDI. All rights reserved.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.json({ success: true, message: '📧 If this email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// POST /api/auth/reset-password
// Validates reset token and sets new password.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, role, newPassword } = req.body;
    if (!token || !role || !newPassword)
      return res.status(400).json({ success: false, message: 'Token, role and new password required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    let user;
    if (role === 'patient') {
      user = await Patient.findOne({
        where: { resetPasswordToken: hashedToken },
      });
      if (user && new Date(user.resetPasswordExpires) < Date.now()) {
        return res.status(400).json({ success: false, message: 'Reset token has expired' });
      }
    }

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ success: true, message: '✅ Password reset successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN LOGIN
// POST /api/auth/admin/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const admin = await Admin.findOne({ where: { email: email.toLowerCase() } });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const token = generateToken(admin.id, 'admin');
    res.json({
      success: true, message: 'Admin login successful', token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
