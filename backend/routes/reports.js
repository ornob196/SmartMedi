// ─── Report Routes (PostgreSQL / Sequelize) ───────────────────────────────────
// Handles patient medical report uploads (PDF, JPG, PNG, TXT, DOCX).
// Files stored in: /uploads/reports/ directory on server.
// POST /api/reports           → upload a new report
// GET  /api/reports/my        → patient: get own reports
// GET  /api/reports/patient/:id → doctor: get patient's reports
// DELETE /api/reports/:id     → delete a report

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Report } = require('../models');
const { protect, patientOnly, doctorOnly } = require('../middleware/auth');

const router = express.Router();

// ── Multer config for report uploads ──────────────────────────────────────────
// Allows: PDF, JPG, PNG, TXT, DOCX — max 20MB per file
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report_${req.user.id}_${Date.now()}${ext}`);
  },
});
const reportUpload = multer({
  storage: reportStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // max 20MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
      'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type. Allowed: PDF, JPG, PNG, TXT, DOCX'));
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports
// Patient: Upload a medical report file
// Expects multipart/form-data with: file, title, description, reportType, reportDate
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, patientOnly, reportUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { title, description, reportType, reportDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Report title is required' });

    const fileUrl = `/uploads/reports/${req.file.filename}`;
    const report = await Report.create({
      patientId: req.user.id,
      title,
      description: description || '',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl,
      reportType: reportType || 'other',
      reportDate: reportDate || new Date(),
    });

    res.status(201).json({ success: true, message: '✅ Report uploaded successfully!', report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/my
// Patient: Get own uploaded reports (most recent first)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my', protect, patientOnly, async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { patientId: req.user.id },
      order: [['reportDate', 'DESC']],
    });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/patient/:patientId
// Doctor: View a specific patient's reports (for AI analysis during examination)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/patient/:patientId', protect, doctorOnly, async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { patientId: req.params.patientId },
      order: [['reportDate', 'DESC']],
    });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/reports/:id
// Patient: Delete own report and remove file from disk
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, patientOnly, async (req, res) => {
  try {
    const report = await Report.findOne({
      where: { id: req.params.id, patientId: req.user.id },
    });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // ── Remove file from disk ──
    const filePath = path.join(__dirname, '../../uploads/reports', report.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await report.destroy();
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
