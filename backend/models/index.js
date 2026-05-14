// ─── Models Index (Associations + Sync) ──────────────────────────────────────
// This file:
//   1. Imports all Sequelize models
//   2. Defines all associations (foreign key relationships)
//   3. Exports all models from one place
// All models are synced to PostgreSQL in server.js via sequelize.sync()

const sequelize = require('../config/db');

// ── Import all models ──────────────────────────────────────────────────────────
const Admin = require('./Admin');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const Message = require('./Message');
const Report = require('./Report');

// ─── Define Associations ───────────────────────────────────────────────────────

// ── Patient ↔ Appointment (one patient → many appointments) ───────────────────
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments', onDelete: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// ── Doctor ↔ Appointment (one doctor → many appointments) ─────────────────────
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments', onDelete: 'SET NULL' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

// ── Doctor ↔ Prescription (one doctor → many prescriptions) ───────────────────
Doctor.hasMany(Prescription, { foreignKey: 'doctorId', as: 'prescriptions', onDelete: 'CASCADE' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

// ── Patient ↔ Prescription (one patient → many prescriptions) ─────────────────
Patient.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions', onDelete: 'CASCADE' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// ── Appointment ↔ Prescription (one appointment → one prescription) ────────────
Appointment.hasOne(Prescription, { foreignKey: 'appointmentId', as: 'prescription' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// ── Patient ↔ Report (one patient → many reports) ─────────────────────────────
Patient.hasMany(Report, { foreignKey: 'patientId', as: 'reports', onDelete: 'CASCADE' });
Report.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// ─── Export all models and sequelize instance ──────────────────────────────────
module.exports = {
  sequelize,
  Admin,
  Doctor,
  Patient,
  Appointment,
  Prescription,
  Message,
  Report,
};
