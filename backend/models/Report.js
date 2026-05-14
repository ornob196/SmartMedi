// ─── Report Model (PostgreSQL / Sequelize) ────────────────────────────────────
// Table: Reports
// Stores medical reports uploaded by patients.
// Supported file types: PDF, JPG, PNG, TXT, DOCX
// Files are stored on disk at: /uploads/reports/
// fileUrl: relative URL path to access the file

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  // ── Primary Key ────────────────────────────────────────────────────────────
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ── Foreign Key ────────────────────────────────────────────────────────────
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'patients', key: 'id' },
  },

  // ── Report Metadata ────────────────────────────────────────────────────────
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,   // e.g., "Blood Test Results - Jan 2025"
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',   // Optional description of the report
  },

  // ── File Info ──────────────────────────────────────────────────────────────
  fileName: {
    type: DataTypes.STRING(300),
    allowNull: false,   // Unique filename stored on disk
  },
  originalName: {
    type: DataTypes.STRING(300),
    allowNull: false,   // Original file name from user's computer
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,   // e.g., "application/pdf", "image/jpeg"
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,   // File size in bytes
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,   // Relative URL: /uploads/reports/filename.pdf
  },

  // ── Report Category ────────────────────────────────────────────────────────
  reportType: {
    type: DataTypes.ENUM('blood_test', 'xray', 'mri', 'ct_scan', 'ecg', 'prescription', 'other'),
    defaultValue: 'other',
  },

  // ── Report Date ────────────────────────────────────────────────────────────
  reportDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,   // Date the report was created/scanned
  },
}, {
  tableName: 'reports',
  timestamps: true,
});

module.exports = Report;
