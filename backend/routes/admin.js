// ─── Admin Routes (PostgreSQL / Sequelize) ────────────────────────────────────
// Admin panel endpoints for managing the SMARTMEDI platform.
// All routes require admin JWT token.
//
// GET  /api/admin/stats              → system statistics
// GET  /api/admin/doctors            → all doctors (approved + pending)
// POST /api/admin/doctors/:id/approve → approve a doctor registration
// POST /api/admin/doctors/:id/reject  → reject a doctor registration
// GET  /api/admin/patients           → all registered patients
// GET  /api/admin/appointments       → all appointments
// DELETE /api/admin/doctors/:id      → delete a doctor
// DELETE /api/admin/patients/:id     → delete a patient

const express = require('express');
const { Op } = require('sequelize');
const { Doctor, Patient, Appointment, Prescription } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply protect + adminOnly to ALL routes below
router.use(protect, adminOnly);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Dashboard statistics
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalDoctors, pendingDoctors, totalPatients, totalAppointments, totalPrescriptions] = await Promise.all([
      Doctor.count({ where: { isApproved: true } }),
      Doctor.count({ where: { isApproved: false } }),
      Patient.count(),
      Appointment.count(),
      Prescription.count(),
    ]);
    res.json({ success: true, stats: { totalDoctors, pendingDoctors, totalPatients, totalAppointments, totalPrescriptions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/doctors
// List all doctors (both approved and pending)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ['password'] },
      order: [['isApproved', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/doctors/:id/approve
// Approve a pending doctor registration → they can now login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/doctors/:id/approve', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    await doctor.update({ isApproved: true, approvedAt: new Date() });
    res.json({ success: true, message: `✅ Dr. ${doctor.name} has been approved!`, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/doctors/:id/reject
// Reject and delete a pending doctor registration
// ─────────────────────────────────────────────────────────────────────────────
router.post('/doctors/:id/reject', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const name = doctor.name;
    await doctor.destroy();
    res.json({ success: true, message: `❌ Dr. ${name}'s registration has been rejected and removed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/doctors/:id
// Delete a doctor from the system
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    await doctor.destroy();
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/patients
// List all patients
// ─────────────────────────────────────────────────────────────────────────────
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.findAll({
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/patients/:id
// Delete a patient from the system
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    await patient.destroy();
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/appointments
// List all appointments
// ─────────────────────────────────────────────────────────────────────────────
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Doctor, as: 'doctor', attributes: ['name', 'specialty'] },
        { model: Patient, as: 'patient', attributes: ['name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
