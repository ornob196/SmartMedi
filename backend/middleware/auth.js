// ─── Auth Middleware (PostgreSQL / Sequelize) ─────────────────────────────────
// Verifies JWT token in Authorization header.
// Loads user from PostgreSQL based on role (patient/doctor/admin).
// Used by all protected routes.

const jwt = require('jsonwebtoken');
const { Patient, Doctor, Admin } = require('../models');

// ── Protect: verify JWT and load user ─────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Load user from DB based on role ──
    if (decoded.role === 'patient') {
      req.user = await Patient.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      });
      req.userRole = 'patient';
    } else if (decoded.role === 'doctor') {
      req.user = await Doctor.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      req.userRole = 'doctor';
    } else if (decoded.role === 'admin') {
      req.user = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      req.userRole = 'admin';
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token role' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// ── Role Guards ────────────────────────────────────────────────────────────────
const patientOnly = (req, res, next) => {
  if (req.userRole !== 'patient') {
    return res.status(403).json({ success: false, message: 'Access denied: Patients only' });
  }
  next();
};

const doctorOnly = (req, res, next) => {
  if (req.userRole !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Access denied: Doctors only' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = { protect, patientOnly, doctorOnly, adminOnly };
