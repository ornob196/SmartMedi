// ─── Appointment Model (PostgreSQL / Sequelize) ───────────────────────────────
// Table: Appointments
// Links a Patient to a Doctor for a scheduled consultation.
// Status flow: pending → confirmed → completed | cancelled
// meetLink: Google Meet URL generated when appointment is confirmed.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  // ── Primary Key ────────────────────────────────────────────────────────────
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ── Foreign Keys (set via associations in index.js) ────────────────────────
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'patients', key: 'id' },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: true,   // null if doctor not found in DB
    references: { model: 'doctors', key: 'id' },
  },

  // ── Appointment Details ────────────────────────────────────────────────────
  service: {
    type: DataTypes.ENUM('general', 'cardiology', 'neurology', 'orthopedic', 'pediatrics', 'dermatology'),
    allowNull: false,
  },
  doctorName: {
    type: DataTypes.STRING(100),  // Stored as string for backward compatibility
    allowNull: false,
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,     // Date without time (YYYY-MM-DD)
    allowNull: false,
  },
  timeSlot: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bloodType: {
    type: DataTypes.STRING(5),
    defaultValue: '',
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },

  // ── Status ─────────────────────────────────────────────────────────────────
  // pending: just booked | confirmed: doctor accepted | completed: done | cancelled
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },

  // ── Video Call ─────────────────────────────────────────────────────────────
  // meetLink: Google Meet URL auto-generated when appointment is confirmed
  meetLink: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
});

module.exports = Appointment;
