// ─── Patient Routes (PostgreSQL / Sequelize) ──────────────────────────────────
// Handles: patient profile, profile photo upload.
// GET /api/patients/me        → patient's own profile
// PUT /api/patients/me        → update profile
// POST /api/patients/me/photo → upload profile photo

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Patient } = require('../models');
const { protect, patientOnly } = require('../middleware/auth');

const router = express.Router();

// ── Multer config: patient profile photo upload ────────────────────────────────
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `patient_${req.user.id}_${Date.now()}${ext}`);
  },
});
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|webp/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// GET /api/patients/me — Own profile
router.get('/me', protect, patientOnly, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
    });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/patients/me — Update profile
router.put('/me', protect, patientOnly, async (req, res) => {
  try {
    const { phone, bloodGroup, address } = req.body;
    await req.user.update({ phone, bloodGroup, address });
    const updated = await Patient.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
    });
    res.json({ success: true, message: 'Profile updated', patient: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/patients/me/photo — Upload profile photo
router.post('/me/photo', protect, patientOnly, profileUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    await req.user.update({ profilePhoto: photoUrl });
    res.json({ success: true, message: 'Profile photo updated', profilePhoto: photoUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
