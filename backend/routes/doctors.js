// ─── Doctor Routes (PostgreSQL / Sequelize) ───────────────────────────────────
// Handles: list all approved doctors, doctor profile, profile photo upload.
// Profile photos are stored in /uploads/profiles/ directory.
// GET /api/doctors         → public, list all approved doctors (for appointment booking)
// GET /api/doctors/me      → doctor's own profile
// PUT /api/doctors/me      → update profile
// POST /api/doctors/me/photo → upload profile photo (multipart/form-data)

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Doctor } = require('../models');
const { protect, doctorOnly } = require('../middleware/auth');

const router = express.Router();

// ── Multer config: profile photo upload ────────────────────────────────────────
// Files saved to: /uploads/profiles/ with unique filename
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // auto-create dir
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doctor_${req.user.id}_${Date.now()}${ext}`); // unique filename
  },
});
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed (jpg, png, webp)'));
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/doctors
// Public: Returns all APPROVED doctors (for the Doctors page + Appointment booking)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: { isApproved: true },
      attributes: ['id', 'name', 'specialty', 'experience', 'rating', 'consultationFee', 'availability', 'bio', 'qualifications', 'hospital', 'profilePhoto', 'sex'],
      order: [['rating', 'DESC']],
    });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/doctors/me
// Protected (doctor): Returns own profile details
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/doctors/me
// Protected (doctor): Update own profile info
// ─────────────────────────────────────────────────────────────────────────────
router.put('/me', protect, doctorOnly, async (req, res) => {
  try {
    const { specialty, experience, consultationFee, availability, bio, qualifications, hospital, phone } = req.body;
    await req.user.update({ specialty, experience, consultationFee, availability, bio, qualifications, hospital, phone });
    const updated = await Doctor.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json({ success: true, message: 'Profile updated', doctor: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/doctors/me/photo
// Protected (doctor): Upload profile photo
// Expects multipart/form-data with field name 'photo'
// ─────────────────────────────────────────────────────────────────────────────
router.post('/me/photo', protect, doctorOnly, profileUpload.single('photo'), async (req, res) => {
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
