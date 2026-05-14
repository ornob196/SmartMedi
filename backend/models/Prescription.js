// ─── Prescription Model (PostgreSQL / Sequelize) ──────────────────────────────
// Table: Prescriptions
// Stores detailed medical prescriptions issued by doctors.
// medicines field: JSONB array [{name, dosage, frequency, duration, instructions}]
// vitals field: JSONB object {bp, pulse, temperature, weight, height, spo2}
// aiSuggestions: text from AI analysis of symptoms + reports
// Prescription is SAVED TO DB when doctor submits from examination panel.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Prescription = sequelize.define('Prescription', {
  // ── Primary Key ────────────────────────────────────────────────────────────
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ── Foreign Keys ───────────────────────────────────────────────────────────
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'appointments', key: 'id' },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'doctors', key: 'id' },
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'patients', key: 'id' },
  },

  // ── Clinical Info ──────────────────────────────────────────────────────────
  diagnosis: {
    type: DataTypes.TEXT,
    defaultValue: '',   // Primary diagnosis / disease name
  },
  symptoms: {
    type: DataTypes.TEXT,
    defaultValue: '',   // Symptoms observed during examination
  },

  // ── Vitals (stored as JSON) ────────────────────────────────────────────────
  // Example: { bp: "120/80", pulse: "72", temperature: "98.6", weight: "70", height: "170", spo2: "98%" }
  vitals: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },

  // ── Medicines (stored as JSON array) ──────────────────────────────────────
  // Example: [{ name: "Paracetamol", dosage: "500mg", frequency: "3x/day", duration: "5 days", instructions: "After meals" }]
  medicines: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },

  // ── Additional Clinical Info ───────────────────────────────────────────────
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',   // Doctor's additional advice / notes
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,    // Suggested follow-up date
  },
  labTests: {
    type: DataTypes.TEXT,
    defaultValue: '',   // Recommended lab tests
  },

  // ── AI Suggestions ─────────────────────────────────────────────────────────
  // AI-generated disease probability suggestions based on symptoms + previous reports
  // Example: "Based on symptoms: Hypertension (65%), Cardiac Issue (30%), Anxiety (5%)"
  aiSuggestions: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'prescriptions',
  timestamps: true,
});

module.exports = Prescription;
